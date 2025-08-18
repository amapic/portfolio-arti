"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";
import PortfolioHeader from "../components/PortfolioHeader";

interface ApiCategory {
  id: string;
  value: string;
  label: string;
  order: number;
  isActive: boolean;
}

interface GalleryItem {
  id: string;
  category: string;
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
  positions: {
    all: number;
    categoryLarge: number;
    categoryMedium: number;
    categorySmall: number;
  };
}

const SimpleGridPage: React.FC = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const PROJECT_ID = process.env.NEXT_PUBLIC_ID_PROJET;

  // Fonction pour trier les images selon la catégorie et la taille d'écran
  const sortItems = (items: GalleryItem[], filterCategory: string = "*") => {
    const screenWidth = window.innerWidth;
    let positionKey: keyof GalleryItem['positions'];
    
    if (screenWidth <= 480) {
      positionKey = 'categorySmall';
    } else if (screenWidth <= 768) {
      positionKey = 'categoryMedium';
    } else {
      positionKey = 'categoryLarge';
    }
    
    if (filterCategory === "*") {
      positionKey = 'all';
    }
    
    return [...items].sort((a, b) => {
      return a.positions[positionKey] - b.positions[positionKey];
    });
  };

  // Charger les données depuis l'API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

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

        const imagesResponse = await fetch(
          `${API_URL}/api/images?projectId=${PROJECT_ID}`
        );
        if (imagesResponse.ok) {
          const imagesData = await imagesResponse.json();
          const selectedImages = imagesData.filter((img: any) => img.selected);

          const items: GalleryItem[] = selectedImages.map((meta: any) => {
            // Convertir les rectangles horizontaux en carrés
            let processedDimension = meta.dimension || [1, 1];
            let forcedSquare = false;
            
            if (Array.isArray(processedDimension) && processedDimension[0] === 2 && processedDimension[1] === 1) {
              processedDimension = [1, 1]; // Rectangle horizontal → Carré
              forcedSquare = true;
            }

            return {
              id: meta.id,
              category: Array.isArray(meta.category) ? meta.category[0] : meta.category,
              imageUrl: meta.image_url,
              alt: meta.alt,
              titre: meta.titre || "",
              sousTitre: meta.sousTitre || "",
              dimension: processedDimension,
              crop: meta.crop,
              displayDimensions: meta.displayDimensions,
              cropData: meta.cropData,
              isForcedSquare: forcedSquare || meta.isForcedSquare,
              positions: {
                all: meta.positions?.all || 0,
                categoryLarge: meta.positions?.categoryLarge || 0,
                categoryMedium: meta.positions?.categoryMedium || 0,
                categorySmall: meta.positions?.categorySmall || 0,
              },
            };
          });

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

  useEffect(() => {
    if (!loading && galleryItems.length > 0) {
      const waitForImages = () => {
        return new Promise<void>((resolve) => {
          const images = document.querySelectorAll('.grid-item .item-content');
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
            if (bgImage && bgImage !== 'none') {
              const imageUrl = bgImage.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
              const img = new Image();
              img.onload = checkComplete;
              img.onerror = checkComplete;
              img.src = imageUrl;
            } else {
              checkComplete();
            }
          });
        });
      };

      const initIsotope = async () => {
        await waitForImages();
        
        const $ = (window as any).$;
        if ($ && typeof $.fn.isotope === "function") {
          console.log("🎨 Initialisation d'Isotope - Grille Simple");

          const screenWidth = window.innerWidth;
          const layoutMode = screenWidth <= 768 ? "packery" : "packery";

          const $grid = $(".grid").isotope({
            itemSelector: ".grid-item",
            layoutMode: layoutMode,
            percentPosition: true,
            transitionDuration: 400,
            stagger: 100,
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
            fitRows: {
              gutter: 0
            },
          });

          $(".filter-btn")
            .off("click")
            .on("click", function () {
              const filterValue = $(this).attr("data-filter");

              $(".filter-btn").removeClass("active");
              $(this).addClass("active");

              $grid.isotope({ filter: filterValue });
              
              setTimeout(() => {
                $grid.isotope("layout");
              }, 450);
            });

          $(window)
            .off("resize.isotope")
            .on("resize.isotope", function () {
              const screenWidth = window.innerWidth;
              const newLayoutMode = screenWidth <= 768 ? "fitRows" : "masonry";
              
              const currentFilter = $(".filter-btn.active").attr("data-filter") || "*";
              const resortedItems = sortItems(galleryItems, currentFilter);
              setGalleryItems(resortedItems);
              
              $grid.isotope({
                layoutMode: newLayoutMode
              });
              
              $grid.isotope("layout");
            });
        }
      };

      initIsotope();
    }
  }, [loading]);

  // Obtenir les classes CSS pour les dimensions (seulement carrés et verticaux maintenant)
  const getDimensionClass = (dimension: [number, number]) => {
    const [w, h] = dimension;
    // Plus de rectangles horizontaux - seulement carrés [1,1] et verticaux [1,2]
    if (w === 1 && h === 2) return "grid-item--height2";
    return ""; // Tout le reste est carré
  };

  // Obtenir le style de crop adapté pour les carrés forcés
  const getImageCropStyle = (item: GalleryItem) => {
    // Si c'était un rectangle horizontal converti en carré
    if (item.isForcedSquare && item.cropData) {
      const { originalWidth, originalHeight, cropX, cropY, cropWidth, cropHeight } = item.cropData;
      
      // Pour un carré forcé, on centre l'image et on crop les côtés si nécessaire
      const aspectRatio = originalWidth / originalHeight;
      
      if (aspectRatio > 1) {
        // Image plus large que haute - on center horizontalement et on crop les côtés
        const scale = 100;
        return {
          backgroundImage: `url(${item.imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        };
      }
    }

    // Utiliser la logique de crop normale pour les autres cas
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
      if (item.crop.size >= 99) {
        return {
          backgroundImage: `url(${item.imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: `${50 + item.crop.x}% ${50 + item.crop.y}%`,
          backgroundRepeat: "no-repeat",
        };
      } else {
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

  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.isotope/3.0.6/isotope.pkgd.min.js" />

      <style jsx global>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        h1 {
          font-size: 2.5em;
          margin-bottom: 30px;
          text-align: center;
          color: black;
        }

        .grid {
          max-width: 1200px;
          margin: 50px auto 0;
          padding: 0;
        }

        .grid-sizer,
        .grid-item {
          width: calc(25% - 7.5px);
          margin: 5px;
          box-sizing: border-box;
        }

        .grid-item {
          height: calc(25vw - 7.5px);
          max-height: 290px;
          position: relative;
          overflow: hidden;
        }

        /* Rectangles verticaux seulement - pas d'horizontaux */
        .grid-item--height2 {
          height: calc(50vw - 7.5px);
          max-height: 590px;
        }

        .grid-sizer {
          height: 0;
        }

        .item-content {
          width: 100%;
          height: 100%;
          position: relative;
          box-sizing: border-box;
          display: block;
          overflow: hidden;
        }

        .filters {
          text-align: center;
          margin: 30px 0;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 5px;
        }

        .filter-btn {
          background: rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(0, 0, 0, 0.2);
          color: black;
          padding: 10px 8px;
          margin: 5px;
          cursor: pointer;
          min-width: 80px;
          flex: 1;
        }

        .filter-btn:hover,
        .filter-btn.active {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.6);
          font-weight: 600;
        }

        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          color: white;
          text-align: center;
          padding: 20px;
          box-sizing: border-box;
        }

        .grid-item:hover .overlay {
          opacity: 1;
        }

        .overlay h3 {
          margin: 0 0 10px;
          font-size: 1.2em;
          font-weight: bold;
        }

        .overlay p {
          margin: 0;
          font-size: 0.9em;
          opacity: 0.9;
        }

        @media (max-width: 1024px) {
          .grid-sizer,
          .grid-item {
            width: calc(33.333% - 6.67px);
            height: calc(33.333vw - 6.67px);
            max-height: 330px;
          }

          .grid-item--height2 {
            height: calc(66.666vw - 6.67px);
            max-height: 670px;
          }
        }

        @media (max-width: 768px) {
          .grid-sizer,
          .grid-item {
            width: calc(50% - 5px);
            height: calc(50vw - 5px);
            max-height: 370px;
          }

          .grid-item--height2 {
            width: calc(50% - 5px);
            height: calc(100vw - 5px);
            max-height: 750px;
          }
        }

        @media (max-width: 480px) {
          .grid-sizer,
          .grid-item {
            width: 100%;
            height: calc(100vw - 10px);
            margin: 0;
            padding: 5px;
          }

          .grid-item--height2 {
            width: 100%;
            height: calc(200vw - 10px);
          }

          .container {
            padding: 15px;
          }

          .filter-btn {
            min-width: 60px;
            padding: 8px 4px;
            margin: 3px;
            font-size: 14px;
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

          .grid-item--height2 {
            width: 100%;
            height: calc(200vw - 20px);
          }

          .filter-btn {
            min-width: 50px;
            padding: 6px 4px;
            margin: 2px;
            font-size: 13px;
          }

          h1 {
            font-size: 1.8em;
          }
        }
      `}</style>

      <div className="min-h-screen bg-white font-serif p-0 m-0 w-full">
        <PortfolioHeader />

        <div className="container">
          <h1>Galerie Simple</h1>

          {categories.length > 0 && (
            <div className="filters">
              <button className="filter-btn active" data-filter="*">
                Tous
              </button>
              {categories
                .filter((cat) => cat.isActive)
                .map((category) => (
                  <button
                    key={category.id}
                    className="filter-btn"
                    data-filter={`.${category.value}`}
                  >
                    {category.label}
                  </button>
                ))}
            </div>
          )}

          <div className="grid">
            <div className="grid-sizer"></div>
            {galleryItems.map((item) => {
              const dimensionClass = getDimensionClass(item.dimension || [1, 1]);
              return (
                <div
                  key={item.id}
                  className={`grid-item ${dimensionClass} ${item.category}`}
                >
                  <div
                    className="item-content"
                    style={getImageCropStyle(item)}
                  >
                    <div className="overlay">
                      {item.titre && <h3>{item.titre}</h3>}
                      {item.sousTitre && <p>{item.sousTitre}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default SimpleGridPage;
