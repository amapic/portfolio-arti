"use client";

import React, { useState, useEffect, useRef } from "react";
import ImageComponent_new from "./ImageComponent_new";
import PortfolioHeader from "./PortfolioHeader";
import { ImageMeta } from "../types/imageMeta";

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

const LegoGallery_new: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string | "All">("All");
  const [imagesMeta, setImagesMeta] = useState<ImageMeta[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const isotypeRef = useRef<any>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const PROJECT_ID = process.env.NEXT_PUBLIC_ID_PROJET;

  // Chargement des catégories depuis l'API
  const loadCategories = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/categories?projectId=${PROJECT_ID}`
      );
      if (response.ok) {
        const data = await response.json();
        setCategories(
          data.sort((a: ApiCategory, b: ApiCategory) => a.order - b.order)
        );
      }
    } catch (error) {
      console.error("Erreur de chargement des catégories:", error);
    }
  };

  // Charger les métadonnées des images depuis l'API
  useEffect(() => {
    const loadImages = async () => {
      try {
        setLoading(true);
        await loadCategories();

        const response = await fetch(
          `${API_URL}/api/images?projectId=${PROJECT_ID}`
        );
        if (response.ok) {
          const data: ImageMeta[] = await response.json();
          const selectedImages = data.filter((img) => img.selected);
          setImagesMeta(selectedImages);
        } else {
          console.error("Erreur lors du chargement des images");
          setImagesMeta([]);
        }
      } catch (error) {
        console.error("Erreur de connexion à l'API:", error);
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
    categories: meta.category,
    imageUrl: meta.image_url,
    alt: meta.alt,
    titre: meta.titre || "",
    sousTitre: meta.sousTitre || "",
    dimension: meta.dimension,
    crop: meta.crop,
    displayDimensions: meta.displayDimensions,
    cropData: meta.cropData,
  }));

  // Initialiser Isotope une fois que les images sont chargées
  useEffect(() => {
    if (!loading && galleryItems.length > 0) {
      const initIsotope = () => {
        // Utiliser Isotope vanilla JS
        const Isotope = (window as any).Isotope;
        if (Isotope && gridRef.current) {
          console.log("🔥 INIT ISOTOPE vanilla JS"); // DEBUG
          
          // Détruire l'instance précédente si elle existe
          if (isotypeRef.current) {
            isotypeRef.current.destroy();
          }

          // Créer une nouvelle instance Isotope vanilla
          isotypeRef.current = new Isotope(gridRef.current, {
            itemSelector: '.grid-item',
            layoutMode: 'masonry',
            masonry: {
              columnWidth: '.grid-sizer',
              gutter: 8,
            },
            percentPosition: true,
            transitionDuration: '0.6s',
          });
        } else {
          console.log("🔥 Isotope vanilla pas encore chargé"); // DEBUG
        }
      };

      // Attendre que les éléments soient rendus
      setTimeout(initIsotope, 200);
    }

    return () => {
      if (isotypeRef.current) {
        isotypeRef.current.destroy();
        isotypeRef.current = null;
      }
    };
  }, [loading, galleryItems]);

  // Gérer le filtrage avec Isotope
  const handleCategoryChange = (newCategory: string | "All") => {
    console.log("🔥 FILTRAGE:", newCategory); // DEBUG
    setActiveCategory(newCategory);
    
    if (isotypeRef.current) {
      const filterValue = newCategory === "All" ? "*" : `.category-${newCategory}`;
      console.log("🔥 ISOTOPE FILTER:", filterValue); // DEBUG
      isotypeRef.current.arrange({ 
        filter: filterValue,
        transitionDuration: "0.6s"
      });
    } else {
      console.log("🔥 ISOTOPE REF NULL!"); // DEBUG
    }
  };

  return (
    <div className="min-h-screen bg-white font-serif p-0 m-0">
      {/* Header */}
      <PortfolioHeader showHome={false} />

      {/* Category Navigation */}
      <nav
        className="font-exposure mx-2 flex justify-between px-8 pt-12 bg-transparent w-full max-w-[1280px] mx-auto"
        style={{
          fontFamily: "ExposureTrial",
        }}
      >
        {/* Bouton "Toutes" */}
        <button
          key="All"
          className={`
            bg-none border-none text-xl text-black cursor-pointer 
             py-2 font-[400] tracking-wide relative text-center w-[50px] md:w-[90px]
            hover:font-[600] transition-opacity duration-200
            ${activeCategory === "All" ? "font-[600]" : ""}
          `}
          onClick={() => handleCategoryChange("All")}
        >
          Toutes
        </button>

        {/* Boutons des catégories */}
        {categories.map((category) => (
          <button
            key={category.id}
            className={`
              bg-none border-none text-xl text-black cursor-pointer 
               py-2 font-[400] tracking-wide relative text-center w-[50px] md:w-[90px]
              hover:font-[600] transition-opacity duration-200
              ${activeCategory === category.value ? "font-[600]" : ""}
            `}
            onClick={() => handleCategoryChange(category.value)}
          >
            {category.label}
          </button>
        ))}
      </nav>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center items-center py-20">
        </div>
      )}

      {/* No Images Message */}
      {!loading && galleryItems.length === 0 && (
        <div className="flex flex-col justify-center items-center py-20">
          <h2 className="text-2xl font-light text-black opacity-70 mb-4">
            Aucune image disponible
          </h2>
          <p className="text-lg text-black opacity-50">
            Veuillez ajouter des images via l'interface d'administration.
          </p>
        </div>
      )}

      {/* Isotope Gallery Grid */}
      {!loading && galleryItems.length > 0 && (
        <div
          className="isotope-grid p-8 pt-2 mx-auto"
          style={{
            maxWidth: "1280px",
          }}
          ref={gridRef}
        >
          {/* Grid sizer pour Isotope */}
          <div className="grid-sizer"></div>

          {/* Render tous les items, Isotope gère le filtrage */}
          {galleryItems.map((item, index) => {
            const categoryClasses = Array.isArray(item.categories)
              ? item.categories.map(cat => `category-${cat}`).join(" ")
              : `category-${item.categories}`;

            console.log("🔥 ITEM CLASSES:", categoryClasses, item.categories); // DEBUG

            const dimensionClass = (() => {
              const [w, h] = item.dimension || [1, 1];
              if (w === 2 && h === 1) return "grid-item--width2";
              if (w === 1 && h === 2) return "grid-item--height2";
              return "";
            })();

            return (
              <div
                key={item.id}
                className={`grid-item ${categoryClasses} ${dimensionClass}`}
              >
                <ImageComponent_new
                  item={item}
                  dimension={item.dimension || [1, 1]}
                  index={index}
                  crop={item.crop}
                  displayDimensions={item.displayDimensions}
                  isForcedSquare={item.isForcedSquare}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Isotope CSS Styles */}
      <style jsx global>{`
        @font-face {
          font-family: "ExposureTrial";
          src: url("/ExposureTrial-0.woff2") format("woff2");
          font-weight: normal;
          font-style: normal;
        }
        .font-exposure {
          font-family: "ExposureTrial", ui-serif, Georgia, Cambria,
            "Times New Roman", Times, serif;
        }

        /* Isotope Grid Styles */
        .isotope-grid {
          position: relative;
        }

        /* Grid sizers for Isotope */
        .grid-sizer {
          width: 33.333%;
        }
        
        .gutter-sizer {
          width: 0.5%;
        }

        /* Base grid item - 1x1 (carré) */
        .grid-item {
          width: 33.333%;
          margin-bottom: 0.5%;
          border-radius: 0;
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
        }

        /* Taille 2x1 (largeur double) */
        .grid-item--width2 {
          width: 40%;
        }
        
        /* Taille 1x2 (hauteur double) */
        .grid-item--height2 {
          width: 50%;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .grid-item {
            width: 49.5%;
            margin-bottom: 1%;
          }
          
          .grid-item--width2 {
            width: 100%;
          }
          
          .grid-item--height2 {
            width: 49.5%;
          }
          
          .grid-sizer {
            width: 49.5%;
          }
          
          .gutter-sizer {
            width: 1%;
          }
        }
      `}</style>
    </div>
  );
};

export default LegoGallery_new;
