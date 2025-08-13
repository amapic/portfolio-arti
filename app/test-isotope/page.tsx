"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";
import PortfolioHeader from "../components/PortfolioHeader"; // Assurez-vous que ce composant existe
interface ApiCategory {
  id: string;
  value: string;
  label: string;
  order: number;
  isActive: boolean;
}

interface GalleryItem {
  id: string;
  categories: string | string[];
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
}

const TestIsotopePage: React.FC = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemsVisible, setItemsVisible] = useState<boolean[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const PROJECT_ID = process.env.NEXT_PUBLIC_ID_PROJET;

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
            categories: meta.category,
            imageUrl: meta.image_url,
            alt: meta.alt,
            titre: meta.titre || "",
            sousTitre: meta.sousTitre || "",
            dimension: meta.dimension || [1, 1],
            crop: meta.crop,
            displayDimensions: meta.displayDimensions,
            cropData: meta.cropData,
            isForcedSquare: meta.isForcedSquare,
          }));

          setGalleryItems(items);
          
          // Initialiser le tableau de visibilité
          setItemsVisible(new Array(items.length).fill(false));
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
  useEffect(() => {
    if (!loading && galleryItems.length > 0) {
      // Petit délai avant de commencer l'animation
      setTimeout(() => {
        // Faire apparaître les images progressivement
        galleryItems.forEach((_, index) => {
          setTimeout(() => {
            setItemsVisible(prev => {
              const newVisible = [...prev];
              newVisible[index] = true;
              return newVisible;
            });
          }, index * 150); // Délai de 150ms entre chaque image
        });
      }, 200); // Délai initial de 200ms
    }
  }, [loading, galleryItems]);

  // Initialiser Isotope après le chargement
  useEffect(() => {
    if (!loading && galleryItems.length > 0) {
      const initIsotope = () => {
        const $ = (window as any).$;
        if ($ && typeof $.fn.isotope === "function") {
          console.log("🎨 Initialisation d'Isotope avec les données API");

          const $grid = $(".grid").isotope({
            itemSelector: ".grid-item",
            layoutMode: "masonry",
            percentPosition: true,
            transitionDuration: 400,
            hiddenStyle: {
              opacity: 0
            },
            visibleStyle: {
              opacity: 1
            },
            masonry: {
              columnWidth: ".grid-sizer",
              gutter: 0,
            },
          });

          // Gestion des filtres
          $(".filter-btn")
            .off("click")
            .on("click", function () {
              const filterValue = $(this).attr("data-filter");

              // Mise à jour des boutons actifs
              $(".filter-btn").removeClass("active");
              $(this).addClass("active");

              // Application du filtre avec layout forcé
              $grid.isotope({ filter: filterValue });
              
              // Forcer un re-layout après un court délai pour éviter le micro-repositionnement
              setTimeout(() => {
                $grid.isotope("layout");
              }, 450); // Légèrement après la fin de la transition (400ms)
            });

          // Réorganisation lors du redimensionnement
          $(window)
            .off("resize.isotope")
            .on("resize.isotope", function () {
              $grid.isotope("layout");
            });
        }
      };

      // Attendre que les éléments soient rendus et que l'animation soit terminée
      const totalAnimationTime = 200 + (galleryItems.length * 150) + 600; // délai initial + animations + transition
      setTimeout(initIsotope, totalAnimationTime);
    }
  }, [loading, galleryItems]);

  // Obtenir les classes CSS pour les dimensions
  const getDimensionClass = (dimension: [number, number]) => {
    const [w, h] = dimension;
    if (w === 2 && h === 1) return "grid-item--width4";
    if (w === 1 && h === 2) return "grid-item--height2";
    return "";
  };

  // Obtenir le style de crop intelligent pour l'image
  const getImageCropStyle = (item: GalleryItem) => {
    if (!item.crop && !item.cropData) {
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
      const bgPosX = (cropX / (originalWidth - cropWidth)) * 100;
      const bgPosY = (cropY / (originalHeight - cropHeight)) * 100;

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
  const getCategoryColorClass = (category: string | string[]) => {
    const cat = Array.isArray(category) ? category[0] : category;
    switch (cat.toLowerCase()) {
      case "theater":
      case "théâtre":
        return "design";
      case "dance":
      case "danse":
        return "photo";
      case "opera":
      case "opéra":
        return "web";
      case "circus":
      case "cirque":
        return "art";
      default:
        return "design";
    }
  };

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
      {/* Chargement de jQuery et Isotope */}
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.isotope/3.0.6/isotope.pkgd.min.js" />

      {/* CSS exactement comme dans ton HTML */}
      <style jsx global>{`
        /* Import font and text-shadow from PortfolioHeader */
        .hover\\:text-shadow:hover {
          text-shadow: 0 2px 8px rgba(0,0,0,0.25), 0 1px 0 #fff;
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
          padding: 10px 0px;
          margin: 5px;
          /* border-radius: 25px; */
          cursor: pointer;
          /* transition: all 0.3s ease; */
          /* font-weight: bold; */
          width: 100px;
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
          /* max-width: 100%; */
        }

        /* Sizer pour définir la largeur de base */
        .grid-sizer {
          width: 33.33%;
        }

        .grid-item {
          width: 33.33%;
          margin-bottom: 10px;
          padding-right: 10px;
          /* border-radius: 15px; */
          overflow: hidden;
          /* Retirer transition qui conflit avec Isotope */
          /* transition: all 0.3s ease; */
          cursor: pointer;
          position: relative;
          height: calc(33.33vw - 10px);
          max-height: 350px;
          box-sizing: border-box;
          /* Animation progressive */
          opacity: 0;
          /* transform: translateY(40px) scale(0.9) rotateX(15deg); */
          /* transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1); */
        }

        .grid-item.visible {
          opacity: 1;
          /* transform: translateY(0) scale(1) rotateX(0deg); */
        }

        /* Animation avec délai pour les éléments de largeur double */
        .grid-item--width4 {
          /* transform: translateY(50px) scale(0.85) rotateY(10deg); */
          /* transition: all 1s cubic-bezier(0.4, 0, 0.2, 1); */
        }

        .grid-item--width4.visible {
          /* transform: translateY(0) scale(1) rotateY(0deg); */
        }

        /* Animation pour les éléments de hauteur double */
        .grid-item--height2 {
          /* transform: translateX(-30px) scale(0.9) rotateZ(5deg); */
          /* transition: all 0.9s cubic-bezier(0.4, 0, 0.2, 1); */
        }

        .grid-item--height2.visible {
          /* transform: translateX(0) scale(1) rotateZ(0deg); */
        }

        .grid-item > .item-content {
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          /* border-radius: 15px; */
          overflow: hidden;
          /* Transition uniquement pour les propriétés hover */
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .grid-item:hover > .item-content {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        /* Taille 2x1 (largeur double) - largeur = 2 x hauteur */
        .grid-item--width4 {
          width: 66.66%;
          height: calc(33.33vw - 10px);
          max-height: 350px;
        }

        /* Taille 1x2 (hauteur double) - hauteur = 2 x largeur */
        .grid-item--height2 {
          width: 33.33%;
          height: calc((33.33vw - 10px) * 2 + 10px);
          max-height: 710px;
        }

        .item-content {
          padding: 20px;
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
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 20px;
          /* Style de hover comme ImageComponent */
          opacity: 0;
          /* transition: opacity 0.3s ease; */
          pointer-events: none;
        }
        
        /* Hover effect sur les éléments de la grille */
        .grid-item:hover .item-overlay {
          opacity: 1;
        }

        /* Animation pour le texte qui apparaît progressivement */
        .item-title, .item-desc {
          /* transform: translateY(20px); */
          opacity: 0;
          /* transition: all 0.4s ease; */
          transition-delay: 0.1s;
        }

        /* Animation du titre au hover */
        .grid-item:hover .item-title {
          /* transform: translateY(0); */
          opacity: 1;
          transition-delay: 0.1s;
        }

        /* Animation du sous-titre au hover avec délai */
        .grid-item:hover .item-desc {
          /* transform: translateY(0); */
          opacity: 1;
          transition-delay: 0.2s;
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
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
          z-index: 2;
          /* Style similaire à ImageComponent */
          font-weight: 600;
          letter-spacing: 0.05em;
          drop-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
          /* Animation initiale - caché */
          /* transform: translateY(20px); */
          opacity: 0;
          /* transition: all 0.4s ease; */
          transition-delay: 0.1s;
        }

        .item-desc {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9em;
          line-height: 1.4;
          z-index: 2;
          /* Style similaire à ImageComponent */
          margin-top: 0.25rem;
          font-weight: 300;
          drop-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
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

        @media (max-width: 768px) {
          .grid-sizer,
          .grid-item {
            width: 50%;
            height: calc(50vw - 10px);
            max-height: 300px;
            padding-right: 10px;
          }

          .grid-item--width4 {
            width: 100%;
            height: calc(50vw - 10px);
            max-height: 300px;
          }

          .grid-item--height2 {
            width: 50%;
            height: calc((50vw - 10px) * 2 + 10px);
            max-height: 610px;
          }
        }

        @media (max-width: 480px) {
          .grid-sizer,
          .grid-item {
            width: 95%;
            height: calc(95vw / 2);
            max-height: 240px;
            margin-right: 5%;
          }

          .grid-item--width4 {
            width: 95%;
            height: calc(47.5vw);
            max-height: 200px;
          }

          .grid-item--height2 {
            width: 95%;
            height: calc(190vw / 2);
            max-height: 400px;
          }

          .container {
            padding: 15px;
          }

          h1 {
            font-size: 2em;
          }
        }
      `}</style>

      <div className="min-h-screen bg-white font-serif p-0 m-0">
        {/* <h1>🎨 Portfolio avec API</h1> */}
        <PortfolioHeader />
        {!loading && ( <>
        <div
          className="filters justify-center gap-12 pt-12 bg-transparent mx-auto"
          style={{
            width: "1152px",
          }}
        >
          <button 
            className="filter-btn  active bg-none border-none text-xl font-light text-black cursor-pointer py-1 tracking-wide relative text-center w-[50px] md:w-[90px] hover:font-[600] transition-all duration-200 hover:text-shadow" 
            data-filter="*"
            style={{ fontFamily: "ExposureTrial, serif" }}
          >
            Tous
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className="filter-btn  bg-none border-none text-xl  text-black cursor-pointer py-1 tracking-wide relative text-center w-[50px] md:w-[90px] hover:font-[600] transition-all duration-200 hover:text-shadow"
              data-filter={`.category-${category.value}`}
              style={{ fontFamily: "ExposureTrial, serif" }}
            >
              {category.label}
            </button>
          ))}
        </div>

       
         

         
        <div className="grid">
          {/* Élément invisible pour définir la largeur de base */}
          <div className="grid-sizer"></div>

          {/* Rendu des images depuis l'API */}
          {galleryItems.map((item, index) => {
            const categoryClasses = Array.isArray(item.categories)
              ? item.categories.map((cat) => `category-${cat}`).join(" ")
              : `category-${item.categories}`;

            const dimensionClass = getDimensionClass(item.dimension || [1, 1]);
            const colorClass = getCategoryColorClass(item.categories);
            const cropStyle = getImageCropStyle(item);
            const isVisible = itemsVisible[index];

            return (
              <div
                key={item.id}
                className={`grid-item ${categoryClasses} ${dimensionClass} ${isVisible ? 'visible' : ''}`}
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
                    >
                      {item.titre}
                    </div>
                    {item.sousTitre && (
                      <div
                        className={`item-desc ${
                          item.isForcedSquare ? "text-red-300" : ""
                        }`}
                      >
                        {item.sousTitre}
                      </div>
                    )}
                    {item.isForcedSquare && (
                      <div className="item-forced-indicator">
                        <span className="text-red-500 text-xs font-bold bg-white bg-opacity-20 px-2 py-1 rounded">
                          Forcé 1x1
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        </>
        )}
      </div>
        
    </>
  );
};

export default TestIsotopePage;
