"use client";

import React, { useState, useEffect } from "react";
import SimpleLightbox from "./components/SimpleLightbox";
import { Analytics } from "@vercel/analytics/next"
interface ApiCategory {
  id: string;
  value: string;
  label: string;
  order: number;
  isActive: boolean;
}

interface GalleryItem {
  id: string;
  category: string; // Une seule catégorie maintenant
  categories: string[]; // Toutes les catégories pour le filtrage
  imageUrl: string;
  alt: string;
  titre: string;
  sousTitre: string;
  dimension?: [number, number];
  crop?: {
    x: number;
    y: number;
    size: number;
  };
  displayDimensions?: {
    cropWidthPercent: number;
    cropHeightPercent: number;
  };
  cropData?: {
    originalWidth: number;
    originalHeight: number;
    cropX: number;
    cropY: number;
    cropWidth: number;
    cropHeight: number;
    aspectRatio: number;
  };
  isForcedSquare?: boolean;
  // Nouvelles positions de tri
  positions: {
    all: number; // Position dans le classement "Tous"
    categoryLarge: number; // Position dans la catégorie pour les grandes tailles (>768px)
    categoryMedium: number; // Position dans la catégorie pour les tailles intermédiaires (481-768px)
    categorySmall: number; // Position dans la catégorie pour les petites tailles (≤480px)
  };
  /*
    Exemple de structure API attendue :
    {
      "id": "image-1",
      "category": "photo", // Une seule catégorie maintenant
      "image_url": "...",
      "positions": {
        "all": 1,           // 1ère position dans "Tous"
        "categoryLarge": 3, // 3ème position dans "photo" sur desktop
        "categoryMedium": 2,// 2ème position dans "photo" sur tablette  
        "categorySmall": 5  // 5ème position dans "photo" sur mobile
      }
    }
  */
}

const TestIsotopePage: React.FC = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États pour le lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<GalleryItem[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const PROJECT_ID = process.env.NEXT_PUBLIC_ID_PROJET;

  // Fonction pour trier les images selon la catégorie et la taille d'écran
  const sortItems = (items: GalleryItem[], filterCategory: string = "*") => {
    const screenWidth = window.innerWidth;
    let positionKey: keyof GalleryItem["positions"];

    // Déterminer quelle position utiliser selon la taille d'écran
    if (screenWidth <= 480) {
      positionKey = "categorySmall";
      } else if (screenWidth <= 768) {
      positionKey = 'categoryMedium';
    } else {
      positionKey = "categoryLarge";
    }

    // Si c'est "Tous", utiliser la position "all"
    if (filterCategory === "*") {
      positionKey = "all";
    }

    return [...items].sort((a, b) => {
      return a.positions[positionKey] - b.positions[positionKey];
    });
  };

  // Fonction pour ouvrir le lightbox avec les images du filtre actuel
  const openLightbox = (clickedImageId: string) => {
    // Déterminer quel filtre est actuellement actif
    const activeFilter = document.querySelector('.filter-btn.active')?.getAttribute('data-filter') || '*';
    
    // Obtenir les images filtrées selon le filtre actuel
    const filteredImages = activeFilter === '*' 
      ? galleryItems 
      : galleryItems.filter(item => 
          item.categories.some(cat => activeFilter.includes(`category-${cat}`))
        );
    
    // Trier les images selon le filtre actuel
    const sortedImages = sortItems(filteredImages, activeFilter);
    
    // Trouver l'index de l'image cliquée dans la liste filtrée
    const clickedIndex = sortedImages.findIndex(item => item.id === clickedImageId);
    
    // Ouvrir le lightbox
    setLightboxImages(sortedImages);
    setCurrentImageIndex(clickedIndex >= 0 ? clickedIndex : 0);
    setLightboxOpen(true);
  };

  // Charger les données depuis l'API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Charger les catégories
        const categoriesResponse = await fetch(
          `${API_URL}/api/categories?projectId=${PROJECT_ID}`
        );
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(
            categoriesData.sort(
              (a: ApiCategory, b: ApiCategory) => a.order - b.order
            )
          );
        }

        // Charger les images
        const imagesResponse = await fetch(
          `${API_URL}/api/images?projectId=${PROJECT_ID}`
        );
        if (imagesResponse.ok) {
          const imagesData = await imagesResponse.json();
          const selectedImages = imagesData.filter((img: any) => img.selected);

          // Convertir les données API en format pour la galerie
          const items: GalleryItem[] = selectedImages.map((meta: any) => ({
            id: meta.id,
            category: Array.isArray(meta.category)
              ? meta.category[0]
              : meta.category, // Une seule catégorie (première)
            categories: Array.isArray(meta.category)
              ? meta.category
              : [meta.category], // Toutes les catégories pour le filtrage
            imageUrl: meta.image_url,
            alt: meta.alt,
            titre: meta.titre || "",
            sousTitre: meta.sousTitre || "",
            dimension: meta.dimension || [1, 1],
            crop: meta.crop,
            displayDimensions: meta.displayDimensions,
            cropData: meta.cropData,
            isForcedSquare: meta.isForcedSquare,
            // Positions de tri (valeurs par défaut si pas encore définies dans l'API)
            positions: {
              all: meta.positions?.all || 0,
              categoryLarge: meta.positions?.categoryLarge || 0,
              categoryMedium: meta.positions?.categoryMedium || 0,
              categorySmall: meta.positions?.categorySmall || 0,
            },
          }));

          const sortedItems = sortItems(items);
          setGalleryItems(sortedItems);
        }
      } catch (error) {
        console.error("Erreur de chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [API_URL, PROJECT_ID]);

  // Animation progressive des images après le chargement

  // Initialiser Isotope après le chargement
  useEffect(() => {
    // alert(window.innerWidth)
    if (!loading && galleryItems.length > 0) {
      // Fonction pour charger les scripts dynamiquement
      const loadScripts = async () => {
        try {
          // Chargement séquentiel des scripts
          await loadScript('/scripts/jquery360.js');
          await loadScript('/scripts/isotope.pkgd.min.js');
          await loadScript('/scripts/isotope-packery.pkgd.js');
          
          console.log('✅ Tous les scripts sont chargés');
          return true;
        } catch (error) {
          console.error('❌ Erreur lors du chargement des scripts:', error);
          throw error;
        }
      };

      // Fonction utilitaire pour charger un script
      const loadScript = (src: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          // Vérifier si le script est déjà chargé
          const existingScript = document.querySelector(`script[src="${src}"]`);
          if (existingScript) {
            resolve();
            return;
          }

          const script = document.createElement('script');
          script.src = src;
          script.async = true;
          
          script.onload = () => {
            console.log(`✅ Script chargé: ${src}`);
            resolve();
          };
          
          script.onerror = () => {
            console.error(`❌ Erreur de chargement: ${src}`);
            reject(new Error(`Failed to load script: ${src}`));
          };
          
          document.head.appendChild(script);
        });
      };

      // Fonction pour vérifier que jQuery et Isotope sont disponibles
      const waitForLibraries = (): Promise<void> => {
        return new Promise((resolve) => {
          const checkLibraries = () => {
            const $ = (window as any).$;
            if ($ && typeof $.fn === 'object' && typeof $.fn.isotope === 'function') {
              // Double vérification que jQuery fonctionne
              try {
                $('<div>').remove();
                console.log('✅ jQuery et Isotope sont prêts');
                resolve();
              } catch (e) {
                setTimeout(checkLibraries, 100);
              }
            } else {
              setTimeout(checkLibraries, 100);
            }
          };
          checkLibraries();
        });
      };

      // Fonction pour attendre que toutes les images soient chargées
      const waitForImages = () => {
        return new Promise<void>((resolve) => {
          const images = document.querySelectorAll(".grid-item .item-content");
          let loadedCount = 0;
          const totalImages = images.length;

          if (totalImages === 0) {
            resolve();
            return;
          }

          const checkComplete = () => {
            loadedCount++;
            if (loadedCount >= totalImages) {
              resolve();
            }
          };

          images.forEach((element) => {
            const bgImage = window.getComputedStyle(element).backgroundImage;
            if (bgImage && bgImage !== "none") {
              const imageUrl = bgImage.replace(/url\(['"]?(.*?)['"]?\)/i, "$1");
              const img = new Image();
              img.onload = checkComplete;
              img.onerror = checkComplete; // Même en cas d'erreur, on continue
              img.src = imageUrl;
            } else {
              checkComplete(); // Pas d'image de fond
            }
          });
        });
      };

      const initIsotope = async () => {
        try {
          // Charger les scripts d'abord
          await loadScripts();
          
          // Attendre que les librairies soient disponibles
          await waitForLibraries();
        
          // Attendre que toutes les images soient chargées
          await waitForImages();

          const $ = (window as any).$;
          if ($ && typeof $.fn.isotope === "function") {
            console.log("🎨 Initialisation d'Isotope avec les données API");

            // Détecter la taille d'écran pour choisir le bon layout
            const screenWidth = window.innerWidth;
            const layoutMode = screenWidth <= 768 ? "packery" : "packery";

            // Créer un objet avec toutes les options Isotope pour la réutilisation
            const isotopeOptions = {
              itemSelector: ".grid-item",
              layoutMode: layoutMode,
              percentPosition: true,
              transitionDuration: 400,
              hiddenStyle: {
                opacity: 0
              },
              visibleStyle: {
                opacity: 1
              },
              packery:{
                columnWidth: ".grid-sizer",
                gutter: 0
              },
              // Configuration du tri par position
              getSortData: {
                position: function(itemElem: Element) {
                  const id = $(itemElem).attr('data-id');
                  const item = galleryItems.find(item => item.id === id);
                  // Déterminer quelle position utiliser selon la taille d'écran
                  const screenWidth = window.innerWidth;
                  let positionKey: keyof GalleryItem["positions"] = "all";
                  
                  if (screenWidth <= 480) {
                    positionKey = "categorySmall";
                  } else if (screenWidth <= 768) {
                    positionKey = "categoryMedium";
                  } else {
                    positionKey = "categoryLarge";
                  }
                  
                  return item ? item.positions[positionKey] : 0;
                }
              },
              sortBy: 'position',
              sortAscending: true,
              initLayout: false // Désactiver le layout initial pour contrôler l'apparition des éléments
            };
            
            // Masquer la grille avant l'initialisation
            // $(".grid").css({ opacity: 0 });
            
            // Initialiser Isotope avec toutes les options, mais sans layout initial
            const $grid = $(".grid").isotope(isotopeOptions);
            
            // Lier l'événement arrangeComplete pour afficher les éléments seulement quand tout est bien positionné
            // $grid.isotope('on', 'arrangeComplete', function(filteredItems: Element[]) {
            //   console.log('Arrangement terminé, affichage des éléments');
            //   // Afficher la grille une fois que le layout est terminé
            //   $(".grid").animate({ opacity: 1 }, 300);
            // });
            
            // Déclencher manuellement le layout initial
            $grid.isotope();
            $(".grid").css({ opacity: 1 });

            // Fonction pour enlever les accents
            const removeAccents = (str: string) => {
              return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            };

            // Gestion des filtres
            $(".filter-btn")
              .off("click")
              .on("click", function (this: HTMLElement) {
                // alert(window.innerWidth)
                let filterValue = $(this).attr("data-filter");
                
                // Enlever les accents potentiels dans filterValue
                if (filterValue && filterValue !== "*") {
                  filterValue = removeAccents(filterValue);
                }
                // alert(filterValue)
                // Mise à jour des boutons actifs
                $(".filter-btn").removeClass("active");
                $(this).addClass("active");

                // Cacher complètement la grille pendant le filtrage
                // $(".grid").css({ opacity: 1 });
                
                // Attendre que la transition d'opacité soit terminée avant de réarranger les éléments
                setTimeout(() => {
                  // Application du filtre avec maintien du tri
                  
                  $grid.isotope({ 
                    filter: filterValue,
                    percentPosition: true,
                    transitionDuration: 400,
                    // Conserver les options de tri lorsqu'on filtre
                    sortBy: 'position',
                    sortAscending: true
                  });
                  // $(".grid").css({ opacity: 1 });
                }, 300); // Délai correspondant à la durée de la transition CSS sur .grid
              });

            // Réorganisation lors du redimensionnement
            $(window)
              .off("resize.isotope")
              .on("resize.isotope", function (this: Window) {
                // console.log("coucou");
                // Changer le layout selon la taille d'écran
                const screenWidth = window.innerWidth;
                const newLayoutMode = screenWidth <= 768 ? "packery" : "packery";

                // Réappliquer le filtre et le tri avec les bonnes options selon la taille d'écran
                const currentFilter =
                  $(".filter-btn.active").attr("data-filter") || "*";
                
                // Cacher complètement la grille pendant le redimensionnement
                // $(".grid").css({ opacity: 0 });
                
                // Attendre que la transition d'opacité soit terminée avant de réarranger les éléments
                setTimeout(() => {
                  // Mise à jour du tri pour refléter la nouvelle taille d'écran
                  $grid.isotope({
                  layoutMode: newLayoutMode,
                  // Force Isotope à recalculer les positions selon la nouvelle taille d'écran
                  sortBy: 'position', 
                  sortAscending: true,
                  filter: currentFilter,
                  // masonry: {
                  //   columnWidth: ".grid-sizer",
                  //   gutter: 0,
                  // },
                  packery: {
                    columnWidth: ".grid-sizer",
                    gutter: 0,
                  },
                  // itemSelector: '.mini-item',
                  percentPosition: true
                });

                $grid.isotope("layout");
                }, 300); // Délai correspondant à la durée de la transition CSS sur .grid
              });
          }
        } catch (error) {
          console.error('Erreur lors de l\'initialisation d\'Isotope:', error);
          throw error;
        }
      };

      // Lancer l'initialisation avec gestion d'erreurs
      initIsotope().catch((error) => {
        console.error('Erreur lors de l\'initialisation d\'Isotope:', error);
        // Réessayer une fois après un délai plus long
        setTimeout(() => {
          initIsotope().catch((retryError) => {
            console.error('Échec définitif de l\'initialisation d\'Isotope:', retryError);
          });
        }, 2000);
      });
    }
  }, [loading]);

  // Obtenir les classes CSS pour les dimensions
  const getDimensionClass = (dimension: [number, number]) => {
    const [w, h] = dimension;
    if (w === 2 && h === 1) return "grid-item--width4";
    if (w === 1 && h === 2) return "grid-item--height2";
    return "";
  };

  // Obtenir le style de crop intelligent pour l'image
  const getImageCropStyle = (item: GalleryItem) => {
    // Pour les images sans données de crop, utiliser un comportement intelligent
    if (!item.crop && !item.cropData) {
      // Si c'est une image rectangulaire (2x1 ou 1x2), utiliser contain pour éviter la déformation
      const [w, h] = item.dimension || [1, 1];
      if (w === 2 || h === 2) {
        return {
          backgroundImage: `url(${item.imageUrl})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        };
      }
      
      // Pour les images carrées (1x1), utiliser cover
      return {
        backgroundImage: `url(${item.imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
    }

    // Utiliser cropData si disponible (plus précis)
    if (item.cropData) {
      const {
        originalWidth,
        originalHeight,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
      } = item.cropData;

      // Calculer les pourcentages pour background-position et background-size
      const bgSizeX = (originalWidth / cropWidth) * 100;
      const bgSizeY = (originalHeight / cropHeight) * 100;
      
      // Cas spécial : si le crop couvre 100% de l'image dans une dimension,
      // alors il n'y a pas besoin de repositionnement dans cette dimension
      const bgPosX = (originalWidth === cropWidth) ? 50 : (cropX / (originalWidth - cropWidth)) * 100;
      const bgPosY = (originalHeight === cropHeight) ? 50 : (cropY / (originalHeight - cropHeight)) * 100;

      return {
        backgroundImage: `url(${item.imageUrl})`,
        backgroundSize: `${bgSizeX}% ${bgSizeY}%`,
        backgroundPosition: `${isNaN(bgPosX) ? 50 : bgPosX}% ${
          isNaN(bgPosY) ? 50 : bgPosY
        }%`,
        backgroundRepeat: "no-repeat",
      };
    }

    // Utiliser crop classique en fallback
    if (item.crop) {
      // Si crop.size est proche de 100, c'est probablement un crop centré simple
      if (item.crop.size >= 99) {
        // Crop centré simple - utiliser la position directement
        return {
          backgroundImage: `url(${item.imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: `${50 + item.crop.x}% ${50 + item.crop.y}%`,
          backgroundRepeat: "no-repeat",
        };
      } else {
        // Crop avec zoom
        const scale = 100 / item.crop.size;
        const translateX = -item.crop.x * scale;
        const translateY = -item.crop.y * scale;

        return {
          backgroundImage: `url(${item.imageUrl})`,
          backgroundSize: `${scale * 100}%`,
          backgroundPosition: `${translateX}% ${translateY}%`,
          backgroundRepeat: "no-repeat",
        };
      }
    }

    // Fallback par défaut
    return {
      backgroundImage: `url(${item.imageUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
  };

  // Obtenir la classe de catégorie pour les couleurs

  // if (loading) {
  //   return (
  //     <div
  //       style={{
  //         minHeight: "100vh",
  //         background: "white",
  //         display: "flex",
  //         alignItems: "center",
  //         justifyContent: "center",
  //       }}
  //     >
  //       <div style={{ color: "black", fontSize: "1.2em" }}>
  //         Chargement des images...
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <>
      {/* CSS exactement comme dans ton HTML */}
      <style jsx global>{`
        /* Import font and text-shadow from PortfolioHeader */
        .hover\\:text-shadow:hover {
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.25), 0 1px 0 #fff;
        }
        @font-face {
          font-family: "ExposureTrial";
          src: url("/ExposureTrial-0.woff2") format("woff2");
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        * {
          box-sizing: border-box;
        }

        body {
          font-family: "Arial", sans-serif;
          margin: 0;
          /* padding: 20px; */
          /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
          min-height: 100vh;
        }
        
        /* Style pour les éléments - transition simplifiée */
        .grid {
          transition: opacity 0.3s ease;
        }
        
        .grid-item {
          will-change: transform;
        }

        /* .container {
          max-width: 1200px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 30px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
        } */

        h1 {
          text-align: center;
          color: white;
          margin-bottom: 30px;
          font-size: 2.5em;
          /* text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); */
        }

        .filters {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
        }

        .filter-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: black;
          padding: 10px 8px;
          margin: 5px;
          /* border-radius: 25px; */
          cursor: pointer;
          /* transition: all 0.3s ease; */
          /* font-weight: bold; */
          /* min-width: 80px; */
          flex: 1;
        }

        .filter-btn:hover,
        .filter-btn.active {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.6);
          font-weight: 600;
          /* transform: translateY(-2px); */
          /* box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); */
        }

        .grid {
          margin: 0 auto;
          max-width: 1200px;
          padding: 0;
          /* max-width: 100%; */
        }

        /* Sizer pour définir la largeur de base */
        .grid-sizer {
          width: 33.33%;
        }

        .grid-item {
          width: 33.33%;
          margin: 0;
          padding: 5px;
          /* border-radius: 15px; */
          overflow: hidden;
          /* Retirer transition qui conflit avec Isotope */
          /* transition: all 0.3s ease; */
          cursor: pointer;
          position: relative;
          height: calc(33.33vw - 10px);
          max-height: calc(400px - 10px);
          /* max-height: 350px; */
          box-sizing: border-box;
        }

        /* Animation avec délai pour les éléments de largeur double */
        .grid-item--width4 {
          max-height: calc(400px - 10px);
          /* transform: translateY(50px) scale(0.85) rotateY(10deg); */
          /* transition: all 1s cubic-bezier(0.4, 0, 0.2, 1); */
        }

        /* Animation pour les éléments de hauteur double */
        .grid-item--height2 {
          max-height: calc(800px - 20px);
          /* transform: translateX(-30px) scale(0.9) rotateZ(5deg); */
          /* transition: all 0.9s cubic-bezier(0.4, 0, 0.2, 1); */
        }

        .grid-item > .item-content {
          /* box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); */
          /* border-radius: 15px; */
          overflow: hidden;
          /* Transition uniquement pour les propriétés hover */
          transition: transform 0.3s ease;
        }

        .grid-item:hover > .item-content {
          /* transform: translateY(-2px); */
          /* box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);  */
        }

        /* Taille 2x1 (largeur double) - largeur = 2 x hauteur */
        .grid-item--width4 {
          /* width: 66.66%;* */
          width: 66.66%;
          height: calc(33.33vw - 10px);
          /* max-height: 350px; */
        }

        /* Taille 1x2 (hauteur double) - hauteur = 2 x largeur */
        .grid-item--height2 {
          width: 33.33%;
          height: calc((33.33vw - 10px) * 2);
          /* max-height: 710px; */
        }

        .item-content {
          /* padding: 20px; */
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          position: relative;
          overflow: hidden;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .item-overlay {
          position: absolute;
          inset: 0;
          // background: rgba(0, 0, 0, 0.4);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 20px;
          /* Style de hover comme ImageComponent */
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        /* Hover effect sur les éléments de la grille */
        .grid-item:hover .item-overlay {
          opacity: 1;
        }

        /* Animation pour le texte qui apparaît progressivement */
        .item-title,
        .item-desc {
          /* transform: translateY(20px); */
          opacity: 0;
          /* transition: all 0.4s ease; */
          transition-delay: 0.1s;
        }

        /* Animation du titre au hover */
        .grid-item:hover .item-title {
          /* transform: translateY(0); */
          opacity: 1;
          transition: all 0.5s ease-out;
        }

        /* Animation du sous-titre au hover avec délai */
        .grid-item:hover .item-desc {
          /* transform: translateY(0); */
          opacity: 1;
          ease
          transition: all 0.5s ease-out;
        }

        .design {
          background: linear-gradient(45deg, #ff6b6b, #feca57);
        }
        .photo {
          background: linear-gradient(45deg, #48cae4, #0077b6);
        }
        .web {
          background: linear-gradient(45deg, #06d6a0, #118ab2);
        }
        .art {
          background: linear-gradient(45deg, #f72585, #b5179e);
        }

        .item-title {
          font-size: 1.4em;
          font-weight: bold;
          color: white;
          margin-bottom: 10px;
          // text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
          z-index: 2;
          /* Style similaire à ImageComponent */
          font-weight: 600;
          letter-spacing: 0.05em;
          // drop-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
          /* Animation initiale - caché */
          /* transform: translateY(20px); */
          opacity: 0;
          /* transition: all 0.4s ease; */
          transition-delay: 0.1s;
        }

        .item-desc {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1em;
          line-height: 1.4;
          z-index: 2;
          /* Style similaire à ImageComponent */
          margin-top: 0.25rem;
          font-weight: 300;
          // drop-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
          /* Animation initiale - caché */
          /* transform: translateY(20px); */
          opacity: 0;
          /* transition: all 0.4s ease; */
          transition-delay: 0.1s;
        }

        .item-category {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.3);
          color: white;
          padding: 5px 10px;
          /* border-radius: 15px; */
          font-size: 0.8em;
          font-weight: bold;
          z-index: 3;
        }

        /* .grid{
            padding-left:10px
          } */

        @media (max-width: 768px) {
          .grid{
            width: calc(100% - 10px);
          }
          .grid-sizer,
          .grid-item {
            width: 50%;
            height: calc(50vw - 10px);
            /* max-height: 300px; */
            margin: 0;
            padding: 5px;
          }

          .grid-item--width4 {
            width: 100%;
            height: calc(50vw - 10px);
            /* max-height: 300px; */
          }

          .grid-item--height2 {
            width: 50%;
            
            height: calc((50vw - 10px) * 2 + 10px);
            /* max-height: 610px; */
          }
        }

        @media (max-width: 480px) {
          .grid-sizer,
          .grid-item {
            width: 100%;
            height: calc(100vw - 10px);
            /* max-height: 240px; */
            margin: 0;
            padding: 5px;
            /* margin-right: 5%; */
          }

          .grid-item--width4 {
            width: 100%;
            height: calc(50vw - 10px);
            /* max-height: 200px; */
          }

          .grid-item--height2 {
            width: 100%;
            height: calc(200vw - 10px);
            /* width: 95%;
            height: calc(190vw / 2); */
            /* max-height: 400px; */
          }

          .container {
            padding: 15px;
          }

          .filter-btn {
            /* min-width: 60px; */
            padding: 8px 1px;
            margin: 1px;
            font-size: 14px;
            text-align:center;
            display: inline-block;
          }

          h1 {
            font-size: 2em;
          }
        }

        @media (max-width: 360px) {
          .container {
            padding: 10px;
          }

          .grid {
            margin: 0;
          }

          .grid-sizer,
          .grid-item {
            width: 100%;
            height: calc(100vw - 20px);
            margin: 0;
            padding: 5px;
          }

          .grid-item--width4 {
            width: 100%;
            height: calc(50vw - 20px);
          }

          .grid-item--height2 {
            width: 100%;
            height: calc(200vw - 20px);
          }

          .filter-btn {
            /* min-width: 50px; */
            padding: 6px 4px;
            margin: 2px;
            font-size: 13px;
          }

          h1 {
            font-size: 1.8em;
          }
        }
      `}</style>
        <Analytics />
      <div className="min-h-screen bg-white font-serif p-0 m-0 w-full">
        {/* <h1>🎨 Portfolio avec API</h1> */}
        {!loading && (
          <>
            <div
              className="filters justify-center gap-0 md:gap-4 lg:gap-12 pt-12 bg-transparent mx-auto sm:max-w-[100%] md:max-w-[1152px]"
              style={{
                // maxWidth: "1152px",
              }}
            >
              <button
                className="filter-btn  active bg-none border-none text-sm lg:text-xl font-light text-black cursor-pointer py-0 md:py-1 tracking-wide relative text-center max-w-[70px] md:max-w-none md:w-[90px] hover:font-[600] transition-all duration-200 hover:text-shadow"
                data-filter="*"
                style={{ fontFamily: "ExposureTrial, serif" }}
              >
                Tous
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  className="filter-btn  bg-none border-none text-sm lg:text-xl  text-black cursor-pointer py-0 md:py-1 tracking-wide relative text-center max-w-[70px] md:max-w-none md:w-[90px] hover:font-[600] transition-all duration-200 hover:text-shadow"
                  data-filter={`.category-${category.value}`}
                  style={{ fontFamily: "ExposureTrial, serif" }}
                >
                  {category.label}
                </button>
              ))}
            </div>

            <div className="grid w-full xl:w-[1200px]" style={{ opacity: 0 }}>
              {/* Élément invisible pour définir la largeur de base */}
              <div className="grid-sizer"></div>

              {/* Rendu des images depuis l'API */}
              {galleryItems.map((item, index) => {
                // Générer les classes pour toutes les catégories
                const categoryClasses = item.categories
                  .map(cat => `category-${cat}`)
                  .join(' ');

                const dimensionClass = getDimensionClass(
                  item.dimension || [1, 1]
                );
                // const colorClass = getCategoryColorClass(item.category);
                const cropStyle = getImageCropStyle(item);

                return (
                  <div
                    key={item.id}
                    data-id={item.id}
                    className={`grid-item ${categoryClasses} ${dimensionClass} cursor-pointer`}
                    onClick={() => openLightbox(item.id)}
                  >
                    <div className={`item-content`} style={cropStyle}>
                      <div className="item-overlay">
                        {/* <div className="item-category">
                      {Array.isArray(item.categories)
                        ? item.categories[0]
                        : item.categories}
                    </div> */}
                        <div
                          className={`item-title ${
                            item.isForcedSquare ? "text-red-400" : ""
                          }`}
                          style={{ fontFamily: "ExposureTrial, serif" }}
                        >
                          {item.titre}
                        </div>
                        {item.sousTitre && (
                          <div
                            className={`item-desc ${
                              item.isForcedSquare ? "text-red-300" : ""
                            }`}
                            style={{ fontFamily: "ExposureTrial, serif" }}
                          >
                            {item.sousTitre}
                          </div>
                        )}
                        {/* {item.isForcedSquare && (
                          <div className="item-forced-indicator">
                            <span className="text-red-500 text-xs font-bold bg-white bg-opacity-20 px-2 py-1 rounded">
                              Forcé 1x1
                            </span>
                          </div>
                        )} */}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* SimpleLightbox */}
      <SimpleLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={lightboxImages}
        currentIndex={currentImageIndex}
        onIndexChange={setCurrentImageIndex}
      />
    </>
  );
};

export default TestIsotopePage;
