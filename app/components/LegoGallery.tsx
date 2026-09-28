"use client";

import React, { useState, useEffect, useRef } from 'react';
import ImageComponent from './ImageComponent';
import PortfolioHeader from './PortfolioHeader';
import { ImageMeta } from '../types/imageMeta';
import { CATEGORIES, CategoryType, getCategoryLabel, imageMatchesCategory, normalizeCategoriesArray } from '../types/categories';

interface GalleryItem {
  id: string;
  category: CategoryType | CategoryType[];
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
}

const LegoGallery: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryType | 'All'>('All');
  const [imagesMeta, setImagesMeta] = useState<ImageMeta[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const PROJECT_ID = process.env.NEXT_PUBLIC_ID_PROJET;

  // Utiliser les vraies catégories de l'API + 'All'
  const categories: (CategoryType | 'All')[] = ['All', ...CATEGORIES.map(cat => cat.value)];

  // Charger les métadonnées des images depuis l'API
  useEffect(() => {
    const loadImages = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/images?projectId=${PROJECT_ID}`);
        if (response.ok) {
          const data: ImageMeta[] = await response.json();
          console.log('Images chargées depuis l\'API:', data.length, 'images');
          const selectedImages = data
            .filter(img => img.selected)
            .sort((a, b) => a.position - b.position);
          console.log('Images sélectionnées:', selectedImages.length, 'images');
          setImagesMeta(selectedImages);
        } else {
          console.error('Erreur lors du chargement des images');
          setImagesMeta([]);
        }
      } catch (error) {
        console.error('Erreur de connexion à l\'API:', error);
        setImagesMeta([]);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [API_URL, PROJECT_ID]);

  // Convertir les métadonnées en items de galerie
  const galleryItems: GalleryItem[] = imagesMeta.map((meta, index) => ({
    id: meta.id,
    category: meta.category,
    imageUrl: meta.image_url,
    alt: meta.alt,
    titre: meta.titre || '',
    sousTitre: meta.sousTitre || '',
    dimension: meta.dimension,
    crop: meta.crop,
    displayDimensions: meta.displayDimensions
  }));

  // Obtenir les classes CSS pour les dimensions (système Isotope)
  const getDimensionClass = (dimension: [number, number]) => {
    const [w, h] = dimension;
    if (w === 2 && h === 1) return "grid-item--width4";
    if (w === 1 && h === 2) return "grid-item--height2";
    return "";
  };

  // Initialiser Isotope après le chargement
  useEffect(() => {
    if (!loading && galleryItems.length > 0) {
      // Fonction pour attendre que les scripts soient complètement chargés
      const waitForScripts = () => {
        return new Promise<void>((resolve) => {
          const checkScripts = () => {
            const $ = (window as any).$;
            if ($ && typeof $.fn === 'object' && typeof $.fn.isotope === 'function') {
              // Double vérification que jQuery et Isotope sont vraiment prêts
              try {
                // Test d'une fonction basique jQuery pour s'assurer qu'elle fonctionne
                $('<div>').remove();
                resolve();
              } catch (e) {
                // jQuery n'est pas encore complètement initialisé, réessayer
                setTimeout(checkScripts, 100);
              }
            } else {
              setTimeout(checkScripts, 100); // Réessayer toutes les 100ms
            }
          };
          checkScripts();
        });
      };

      const initIsotope = async () => {
        // Attendre que les scripts soient complètement chargés
        await waitForScripts();
        
        const $ = (window as any).$;
        if ($ && typeof $.fn.isotope === 'function') {
          console.log("🎨 Initialisation d'Isotope avec les données API");
          
          const $grid = $('.lego-grid').isotope({
            itemSelector: '.lego-grid-item',
            layoutMode: 'masonry',
            percentPosition: true,
            masonry: {
              columnWidth: '.lego-grid-sizer',
              gutter: 0
            }
          });

          // Gestion des filtres
          $('.lego-filter-btn').off('click').on('click', function() {
            const filterValue = $(this).attr('data-filter');
            
            // Mise à jour des boutons actifs
            $('.lego-filter-btn').removeClass('active');
            $(this).addClass('active');
            
            // Application du filtre
            $grid.isotope({ filter: filterValue });
          });

          // Réorganisation lors du redimensionnement
          $(window).off('resize.isotope').on('resize.isotope', function() {
            $grid.isotope('layout');
          });
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
  }, [loading, galleryItems]);

  // Filtrer les images selon la catégorie active
  const filteredItems = activeCategory === 'All' 
    ? galleryItems 
    : galleryItems.filter(item => imageMatchesCategory(item.category, activeCategory));

  return (
    <>
      {/* CSS pour le système Isotope - forcé avec !important */}
      <style jsx global>{`
        /* IMPORTANT: Reset pour Isotope - Override les styles existants */
        .lego-grid .lego-grid-item {
          position: relative !important;
          left: auto !important;
          top: auto !important;
          transform: none !important;
          display: block !important;
        }
        
        /* Sizer pour définir la largeur de base */
        .lego-grid-sizer {
          width: 33.33% !important;
        }
        
        .lego-grid-item {
          width: 33.33% !important;
          margin-bottom: 10px !important;
          padding-right: 10px !important;
          transition: all 0.3s ease !important;
          position: relative !important;
          height: calc(33.33vw - 10px) !important;
          max-height: 350px !important;
          box-sizing: border-box !important;
          /* Reset grid CSS */
          grid-column: unset !important;
          grid-row: unset !important;
        }
        
        /* Taille 2x1 (largeur double) */
        .lego-grid-item.grid-item--width4 {
          width: 66.66% !important;
          height: calc(33.33vw - 10px) !important;
          max-height: 350px !important;
        }
        
        /* Taille 1x2 (hauteur double) */
        .lego-grid-item.grid-item--height2 {
          width: 33.33% !important;
          height: calc((33.33vw - 10px) * 2 + 10px) !important;
          max-height: 710px !important;
        }
        
        @media (max-width: 768px) {
          .lego-grid-sizer,
          .lego-grid-item {
            width: 50% !important;
            height: calc(50vw - 10px) !important;
            max-height: 300px !important;
            padding-right: 10px !important;
          }
          
          .lego-grid-item.grid-item--width4 {
            width: 100% !important;
            height: calc(50vw - 10px) !important;
            max-height: 300px !important;
          }
          
          .lego-grid-item.grid-item--height2 {
            width: 50% !important;
            height: calc((50vw - 10px) * 2 + 10px) !important;
            max-height: 610px !important;
          }
        }
        
        @media (max-width: 480px) {
          .lego-grid-sizer,
          .lego-grid-item {
            width: 100% !important;
            height: calc(100vw - 20px) !important;
            max-height: 400px !important;
            padding-right: 0 !important;
          }
          
          .lego-grid-item.grid-item--width4 {
            width: 100% !important;
            height: calc(50vw - 10px) !important;
            max-height: 250px !important;
          }
          
          .lego-grid-item.grid-item--height2 {
            width: 100% !important;
            height: calc(100vw - 20px) !important;
            max-height: 400px !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-white font-serif p-0 m-0">
        {/* Header */}
        <PortfolioHeader />

        {/* Category Navigation */}
        <nav className="flex justify-center gap-12 pt-12 bg-transparent mx-auto"
        style={{ 
              width: '1152px'
        }}
        >
          {categories.map((category) => (
            <button
              key={category}
              className={`
                lego-filter-btn bg-none border-none text-xl font-light text-black cursor-pointer 
                 py-2 tracking-wide font-serif relative text-center w-[50px] md:w-[90px]
                hover:font-[600] transition-opacity duration-200
                ${activeCategory === category ? 'font-semibold opacity-100 active' : ''}
              `}
              data-filter={category === 'All' ? '*' : `.category-${category}`}
              onClick={() => setActiveCategory(category)}
            >
              {category === 'All' ? 'Toutes' : getCategoryLabel(category as CategoryType)}
            </button>
          ))}
        </nav>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div> */}
            {/* <span className="ml-4 text-black opacity-70">Chargement des images...</span> */}
          </div>
        )}

        {/* No Images Message */}
        {!loading && galleryItems.length === 0 && (
          <div className="flex flex-col justify-center items-center py-20">
            <h2 className="text-2xl font-light text-black opacity-70 mb-4">Aucune image disponible</h2>
            <p className="text-lg text-black opacity-50">Veuillez ajouter des images via l'interface d'administration.</p>
          </div>
        )}

        {/* Isotope Gallery Grid */}
        {!loading && galleryItems.length > 0 && (
          <div 
            className="lego-grid p-8 pt-2 mx-auto"
            style={{ 
              width: '1152px',
              maxWidth: '100%'
            }}
          >
            {/* Élément invisible pour définir la largeur de base */}
            <div className="lego-grid-sizer"></div>
            
            {/* Rendu des images avec Isotope */}
            {galleryItems.map((item, index) => {
              const categoryClasses = Array.isArray(item.category)
                ? item.category.map(cat => `category-${cat}`).join(" ")
                : `category-${item.category}`;
              
              const dimensionClass = getDimensionClass(item.dimension || [1, 1]);
              
              return (
                <div
                  key={item.id}
                  className={`lego-grid-item ${categoryClasses} ${dimensionClass}`}
                >
                  <ImageComponent
                    item={item}
                    dimension={item.dimension || [1, 1]}
                    position={[0, 0]} // Position pas utilisée avec Isotope
                    index={index}
                    onImageRef={(idx, el) => {}}
                    isVisible={true}
                    crop={item.crop}
                    displayDimensions={item.displayDimensions}
                    transitionState="stable"
                  />
                </div>
              );
            })}
          </div>
        )}

      </div>
    </>
  );
};

export default LegoGallery;
