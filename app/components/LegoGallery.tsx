"use client";

import React, { useState, useEffect, useRef } from "react";
import ImageComponent from "./ImageComponent";
import PortfolioHeader from "./PortfolioHeader";
import { ImageMeta } from "../types/imageMeta";
// import {isotope} from "isotope-layout";
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
  isForcedSquare?: boolean; // Nouvelle propriété pour marquer les images forcées en 1x1
}

interface PlacedImage {
  item: GalleryItem;
  dimension: [number, number]; // [width, height]
  position: [number, number]; // [col, row]
}

interface TransitioningImage extends PlacedImage {
  transitionState?: "stable" | "entering" | "exiting";
}

const LegoGallery: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string | "All">("All");
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const [placedImages, setPlacedImages] = useState<PlacedImage[]>([]);
  const [transitioningImages, setTransitioningImages] = useState<
    TransitioningImage[]
  >([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [gridHeight, setGridHeight] = useState(10);
  const [imagesMeta, setImagesMeta] = useState<ImageMeta[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isResizing, setIsResizing] = useState(false);
  const [imageSize, setImageSize] = useState(400); // Taille de base des images
  const [gridWidth, setGridWidth] = useState("1280px"); // Largeur de la grille
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Fonctions utilitaires pour les catégories
  const getCategoryLabel = (value: string): string => {
    const category = categories.find((cat) => cat.value === value);
    return category ? category.label : value;
  };

  const imageMatchesCategory = (
    imageCategories: string | string[],
    filterCategory: string | "All"
  ): boolean => {
    if (filterCategory === "All") return true;
    const imageCategoriesArray = Array.isArray(imageCategories)
      ? imageCategories
      : [imageCategories];
    return imageCategoriesArray.includes(filterCategory);
  };

  const normalizeCategoriesArray = (
    categories: string | string[]
  ): string[] => {
    return Array.isArray(categories) ? categories : [categories];
  };

  // Fonction simplifiée pour obtenir la position
  const getImagePosition = (meta: ImageMeta, category: string): number => {
    if (typeof meta.position === "number") {
      return meta.position;
    } else if (meta.position && typeof meta.position === "object") {
      // Si position est un objet avec des catégories
      return (meta.position as any)[category] || 0;
    }
    return 0;
  };

  // Fonction pour calculer la taille des images en fonction de la largeur de l'écran
  const calculateImageSize = (
    windowWidth: number
  ): { imageSize: number; gridWidth: string } => {
    if (windowWidth >= 1280) {
      return { imageSize: 426, gridWidth: "1280px" }; // Taille de base (1280/3 - gap = ~426px)
    } else {
      // Calculer le ratio de réduction basé sur la largeur disponible
      const availableWidth = Math.min(windowWidth - 64, windowWidth * 0.95); // Padding de 32px de chaque côté
      const gridCols = 3;
      const gapSize = 8; // 2 * 0.5rem (gap-2)
      const totalGapWidth = (gridCols - 1) * gapSize;
      const imageWidth = (availableWidth - totalGapWidth) / gridCols;
      const finalImageSize = Math.max(200, Math.floor(imageWidth)); // Minimum 200px

      return {
        imageSize: finalImageSize,
        gridWidth: `calc(100vw - 64px)`,
      };
    }
  };

  // Effet pour gérer le redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      // Annuler le timeout précédent s'il existe
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      // Marquer qu'on est en train de redimensionner
      setIsResizing(true);

      // Programmer la fin du redimensionnement après 150ms sans changement
      resizeTimeoutRef.current = setTimeout(() => {
        const { imageSize: newSize, gridWidth: newGridWidth } =
          calculateImageSize(window.innerWidth);

        // Appliquer les nouvelles tailles avec une transition fluide
        setImageSize(newSize);
        setGridWidth(newGridWidth);

        // Attendre un peu avant de remettre l'opacité normale pour que l'animation soit visible
        setTimeout(() => {
          setIsResizing(false);
        }, 50);
      }, 150);
    };

    // Calculer la taille initiale
    if (typeof window !== "undefined") {
      const { imageSize: initialSize, gridWidth: initialGridWidth } =
        calculateImageSize(window.innerWidth);
      setImageSize(initialSize);
      setGridWidth(initialGridWidth);
    }

    // Ajouter l'écouteur d'événement
    window.addEventListener("resize", handleResize);

    // Nettoyer à la destruction du composant
    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  // Charger les métadonnées des images depuis l'API
  useEffect(() => {
    const loadImages = async () => {
      try {
        setLoading(true);

        // Charger les catégories d'abord
        await loadCategories();

        const response = await fetch(
          `${API_URL}/api/images?projectId=${PROJECT_ID}`
        );
        if (response.ok) {
          const data: ImageMeta[] = await response.json();
          // console.log('Images chargées depuis l\'API:', data.length, 'images'); // Debug
          // console.log('Détail des images:', data); // Debug
          // Filtrer seulement les images sélectionnées et les trier par position selon la catégorie courante
          const selectedImages = data
            .filter((img) => img.selected)
            .sort((a, b) => {
              // Si une catégorie spécifique est sélectionnée, trier par position de cette catégorie
              if (activeCategory !== "All") {
                return (
                  getImagePosition(a, activeCategory) -
                  getImagePosition(b, activeCategory)
                );
              }
              // Sinon, utiliser une position globale (moyenne ou première catégorie)
              const posA = getImagePosition(a, "Theater");
              const posB = getImagePosition(b, "Theater");
              return posA - posB;
            });
          // console.log('Images sélectionnées:', selectedImages.length, 'images'); // Debug
          // console.log('Catégories trouvées:', [...new Set(selectedImages.map(img => img.category))]); // Debug
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
  }, [API_URL, PROJECT_ID, activeCategory]);

  // Convertir les métadonnées en items de galerie
  const galleryItems: GalleryItem[] = imagesMeta.map((meta, index) => ({
    id: meta.id,
    categories: meta.category, // Changement de 'category' vers 'categories'
    imageUrl: meta.image_url,
    alt: meta.alt,
    titre: meta.titre || "",
    sousTitre: meta.sousTitre || "",
    dimension: meta.dimension,
    crop: meta.crop,
    displayDimensions: meta.displayDimensions,
    cropData: meta.cropData,
  }));

  // Fonction pour calculer le crop optimal centré (basée sur ImageCropper et admin/images)
  const getCenteredMaxCrop = (
    originalWidth: number,
    originalHeight: number,
    targetRatio: [number, number]
  ) => {
    const [rw, rh] = targetRatio;
    const cropAspect = rw / rh;
    let cropW = originalWidth;
    let cropH = originalHeight;

    if (originalWidth / originalHeight > cropAspect) {
      // Image plus large que le ratio : hauteur limite
      cropH = originalHeight;
      cropW = cropH * cropAspect;
    } else {
      // Image plus haute (ou égale) que le ratio : largeur limite
      cropW = originalWidth;
      cropH = cropW / cropAspect;
    }

    // Position centrée
    const cropX = (originalWidth - cropW) / 2;
    const cropY = (originalHeight - cropH) / 2;

    return {
      cropX,
      cropY,
      cropWidth: cropW,
      cropHeight: cropH,
    };
  };

  // Calculer le crop optimal pour un format 1x1 (carré centré optimal)
  const calculateOptimalSquareCrop = (
    item: GalleryItem
  ): { x: number; y: number; size: number } => {
    // Si on a les données de crop absolues, les utiliser pour calculer le meilleur carré
    if (item.cropData) {
      const { originalWidth, originalHeight } = item.cropData;

      // Utiliser la fonction éprouvée pour calculer le crop centré optimal
      const { cropX, cropY, cropWidth, cropHeight } = getCenteredMaxCrop(
        originalWidth,
        originalHeight,
        [1, 1]
      );

      // Convertir en pourcentages pour le système de crop
      const xPercent = (cropX / originalWidth) * 100;
      const yPercent = (cropY / originalHeight) * 100;
      // Pour size, on utilise toujours 100% car on a calculé la taille optimale
      const sizePercent = 100;

      console.log(`Crop optimal calculé pour ${item.titre}:`, {
        originalWidth,
        originalHeight,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        xPercent,
        yPercent,
        sizePercent,
      });

      return {
        x: xPercent,
        y: yPercent,
        size: sizePercent,
      };
    }

    // Fallback : crop carré centré par défaut (pour images sans cropData)
    return {
      x: 10, // 10% de marge à gauche
      y: 10, // 10% de marge en haut
      size: 80, // 80% de la taille pour un carré centré
    };
  };

  // Calculer les displayDimensions pour un carré optimal
  const calculateSquareDisplayDimensions = (
    item: GalleryItem
  ): { cropWidthPercent: number; cropHeightPercent: number } => {
    // Si on a les données de crop absolues, calculer les dimensions optimales
    if (item.cropData) {
      const { originalWidth, originalHeight } = item.cropData;

      // Le carré prend la taille de la plus petite dimension
      const squareSize = Math.min(originalWidth, originalHeight);

      // Calculer les pourcentages par rapport à l'image originale
      const widthPercent = (squareSize / originalWidth) * 100;
      const heightPercent = (squareSize / originalHeight) * 100;

      return {
        cropWidthPercent: widthPercent,
        cropHeightPercent: heightPercent,
      };
    }

    // Fallback : crop carré de 80% centré
    return {
      cropWidthPercent: 80,
      cropHeightPercent: 80,
    };
  };

  // Algorithme de placement intelligent avec recherche d'images compatibles
  const generateLayout = (items: GalleryItem[]) => {
    const GRID_WIDTH = 3;
    const placed: PlacedImage[] = [];
    let grid: number[][] = [];

    // Créer une copie des items pour pouvoir les marquer comme placés
    const availableItems = [...items];
    const placedItemIds = new Set<string>();

    while (availableItems.length > placedItemIds.size) {
      // Trouver la prochaine position libre
      const nextPosition = findNextFreePosition(grid, GRID_WIDTH);

      // Chercher une image compatible avec cette position dans l'ordre de priorité
      let imageToPlace: GalleryItem | null = null;
      let itemIndex = -1;

      // 1. D'abord, essayer de placer la prochaine image non placée avec sa dimension originale
      for (let i = 0; i < availableItems.length; i++) {
        const item = availableItems[i];
        if (placedItemIds.has(item.id)) continue;

        const targetDimension: [number, number] = item.dimension || [1, 1];

        if (
          canPlaceAtPosition(grid, nextPosition, targetDimension, GRID_WIDTH)
        ) {
          imageToPlace = item;
          itemIndex = i;
          break;
        }
      }

      // 2. Si aucune image avec sa dimension originale ne peut être placée,
      //    chercher n'importe quelle image qui peut être placée en 1x1
      if (!imageToPlace) {
        for (let i = 0; i < availableItems.length; i++) {
          const item = availableItems[i];
          if (placedItemIds.has(item.id)) continue;

          if (canPlaceAtPosition(grid, nextPosition, [1, 1], GRID_WIDTH)) {
            // Calculer le crop optimal pour cette image forcée en carré
            const optimalCrop = calculateOptimalSquareCrop(item);
            const optimalDisplayDims = calculateSquareDisplayDimensions(item);

            // Créer les nouvelles cropData pour le carré optimal
            let newCropData = item.cropData;
            if (item.cropData) {
              const { originalWidth, originalHeight } = item.cropData;
              const { cropX, cropY, cropWidth, cropHeight } =
                getCenteredMaxCrop(originalWidth, originalHeight, [1, 1]);

              newCropData = {
                originalWidth,
                originalHeight,
                cropX,
                cropY,
                cropWidth,
                cropHeight,
                aspectRatio: 1, // Carré parfait
              };
            }

            console.log(`Forcing image ${item.titre} to 1x1 with crop:`, {
              optimalCrop,
              optimalDisplayDims,
              newCropData,
            });

            // Marquer cette image comme forcée en 1x1
            imageToPlace = {
              ...item,
              isForcedSquare: true,
              crop: optimalCrop,
              displayDimensions: optimalDisplayDims,
              cropData: newCropData,
            };
            itemIndex = i;
            break;
          }
        }
      }

      // Si on a trouvé une image à placer
      if (imageToPlace && itemIndex !== -1) {
        const finalDimension: [number, number] = imageToPlace.isForcedSquare
          ? [1, 1]
          : imageToPlace.dimension || [1, 1];

        // Étendre la grille si nécessaire
        extendGridIfNeeded(grid, nextPosition, finalDimension, GRID_WIDTH);

        // Marquer les cases comme occupées
        markGridCells(grid, nextPosition, finalDimension, 1);

        // Ajouter l'image placée
        placed.push({
          item: imageToPlace,
          dimension: finalDimension,
          position: nextPosition,
        });

        // Marquer l'image comme placée
        placedItemIds.add(imageToPlace.id);

        if (imageToPlace.isForcedSquare) {
          console.log(
            `Image forcée en 1x1: ${imageToPlace.titre} (dimension originale: ${
              availableItems[itemIndex].dimension?.[0] || 1
            }x${availableItems[itemIndex].dimension?.[1] || 1})`
          );
        }
      } else {
        // Si on ne peut rien placer, on arrête pour éviter une boucle infinie
        console.error("Impossible de placer plus d'images dans la grille");
        break;
      }
    }

    // Calculer la hauteur finale de la grille
    const finalGridHeight = grid.length;

    return { placed, gridHeight: finalGridHeight };
  };

  // Trouver la prochaine position libre (balayage de gauche à droite, haut en bas)
  const findNextFreePosition = (
    grid: number[][],
    gridWidth: number
  ): [number, number] => {
    // Si la grille est vide, commencer à [0, 0]
    if (grid.length === 0) {
      return [0, 0];
    }

    // Balayer la grille ligne par ligne
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < gridWidth; col++) {
        if (grid[row][col] === 0) {
          return [col, row];
        }
      }
    }

    // Si aucune position libre, retourner la première position de la nouvelle ligne
    return [0, grid.length];
  };

  // Vérifier si une dimension peut être placée à une position donnée
  const canPlaceAtPosition = (
    grid: number[][],
    [col, row]: [number, number],
    [width, height]: [number, number],
    gridWidth: number
  ): boolean => {
    // Vérifier que ça ne dépasse pas la largeur de la grille
    if (col + width > gridWidth) {
      return false;
    }

    // Vérifier que toutes les cases nécessaires sont libres
    for (let r = row; r < row + height; r++) {
      for (let c = col; c < col + width; c++) {
        // Si on sort de la grille existante, c'est OK (on va l'étendre)
        if (r >= grid.length) {
          continue;
        }
        // Si la case est occupée, on ne peut pas placer
        if (grid[r][c] !== 0) {
          return false;
        }
      }
    }

    return true;
  };

  // Étendre la grille si nécessaire pour accueillir une image
  const extendGridIfNeeded = (
    grid: number[][],
    [col, row]: [number, number],
    [width, height]: [number, number],
    gridWidth: number
  ) => {
    const requiredHeight = row + height;

    // Ajouter des lignes si nécessaire
    while (grid.length < requiredHeight) {
      grid.push(Array(gridWidth).fill(0));
    }
  };

  // Marquer les cases de la grille comme occupées ou libres
  const markGridCells = (
    grid: number[][],
    [col, row]: [number, number],
    [width, height]: [number, number],
    value: number
  ) => {
    for (let r = row; r < row + height; r++) {
      for (let c = col; c < col + width; c++) {
        if (grid[r] && grid[r][c] !== undefined) {
          grid[r][c] = value;
        }
      }
    }
  };

  // Gérer les transitions lors du changement de filtre
  const handleFilterTransition = (
    newLayout: PlacedImage[],
    newGridHeight: number
  ) => {
    setIsTransitioning(true);

    // Toutes les nouvelles images apparaissent avec l'animation d'entrée
    const transitionImages: TransitioningImage[] = newLayout.map(
      (placedImage) => ({
        ...placedImage,
        transitionState: "entering",
      })
    );

    // Mettre à jour immédiatement avec les positions finales
    setTransitioningImages(transitionImages);
    setPlacedImages(newLayout);
    setGridHeight(newGridHeight);

    // Finir la transition après l'animation
    setTimeout(() => {
      setIsTransitioning(false);
      setTransitioningImages([]);
    }, 600); // 500ms animation + 100ms buffer
  };

  // Générer le layout quand les items changent
  useEffect(() => {
    // Ne générer le layout que si on a des images de l'API
    if (galleryItems.length === 0) {
      setPlacedImages([]);
      setTransitioningImages([]);
      return;
    }

    const filteredItems =
      activeCategory === "All"
        ? galleryItems
        : galleryItems.filter((item) =>
            imageMatchesCategory(item.categories, activeCategory)
          );

    // console.log(`Filtrage pour catégorie "${activeCategory}":`, filteredItems.length, 'images sur', galleryItems.length, 'total'); // Debug

    const { placed, gridHeight: newGridHeight } = generateLayout(filteredItems);
    handleFilterTransition(placed, newGridHeight);
  }, [activeCategory, imagesMeta]); // Ajouter imagesMeta comme dépendance

  useEffect(() => {
  // Utilisation de la version CDN d'Isotope
  // @ts-ignore
  const Isotope = (window as any).Isotope;
  if (Isotope) {
    const elem = document.querySelector(".grid");
    if (elem) {
      // @ts-ignore
      const iso = new Isotope(elem, {
        itemSelector: ".grid-item",
        layoutMode: "fitRows",
      });
    }
  }
}, []);

  // Intersection Observer (commenté pour l'instant)
  // useEffect(() => {
  //   var elem = document.querySelector(".grid");
  //   var iso = new Isotope(elem, {
  //     // options
  //     itemSelector: ".grid-item",
  //     layoutMode: "fitRows",
  //   });

  //   // element argument can be a selector string
  //   //   for an individual element
  //   var iso = new Isotope(".grid", {
  //     // options
  //   });
  //   return () => {
  //     itemRefs.current.forEach((ref) => {
  //       if (ref) {
  //         // observer.unobserve(ref);
  //       }
  //     });
  //   };
  // }, []);

  return (
    <div className="min-h-screen bg-white font-serif p-0 m-0">
      {/* Header */}
      <PortfolioHeader showHome={false} />

      {/* Category Navigation */}
      <nav
        className="font-exposure mx-2 flex justify-between px-8 pt-12 bg-transparent w-full max-w-[1280px] mx-auto"
        style={{
          gridTemplateRows: `repeat(${gridHeight}, 400px)`,
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
          onClick={() => setActiveCategory("All")}
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
            onClick={() => setActiveCategory(category.value)}
          >
            {category.label}
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
          <h2 className="text-2xl font-light text-black opacity-70 mb-4">
            Aucune image disponible
          </h2>
          <p className="text-lg text-black opacity-50">
            Veuillez ajouter des images via l'interface d'administration.
          </p>
        </div>
      )}

      {/* Dynamic Lego Gallery Grid */}
      {!loading && galleryItems.length > 0 && (
        <div
          className={`grid grid-cols-3 gap-2 p-8 pt-2 mx-auto transition-all duration-700 ease-out ${
            isResizing ? "opacity-100" : "opacity-100"
          }`}
          style={{
            gridTemplateRows: `repeat(${gridHeight}, ${imageSize}px)`,
            width: gridWidth,
            maxWidth: "100vw",
            transition: "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {(isTransitioning ? transitioningImages : placedImages).map(
            (placedImage, index) => (
              <ImageComponent
                key={placedImage.item.id}
                item={placedImage.item}
                dimension={placedImage.dimension}
                position={placedImage.position}
                index={index}
                onImageRef={(idx, el) => {
                  itemRefs.current[idx] = el;
                }}
                isVisible={visibleItems.includes(index)}
                crop={placedImage.item.crop}
                displayDimensions={placedImage.item.displayDimensions}
                transitionState={
                  isTransitioning
                    ? (placedImage as TransitioningImage).transitionState
                    : "stable"
                }
                isForcedSquare={placedImage.item.isForcedSquare}
              />
            )
          )}
        </div>
      )}

      {/* Global font-face and utility class for ExposureTrial */}
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
      `}</style>
    </div>
  );
};

export default LegoGallery;
