"use client";

import React, { useState, useEffect, useRef } from 'react';
import ImageComponent from './ImageComponent';
import PortfolioHeader from './PortfolioHeader';
import { ImageMeta, getPositionForCategory } from '../types/imageMeta';
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
  cropData?: {
    originalWidth: number;
    originalHeight: number;
    cropX: number;
    cropY: number;
    cropWidth: number;
    cropHeight: number;
    aspectRatio: number;
  };
}

interface PlacedImage {
  item: GalleryItem;
  dimension: [number, number]; // [width, height]
  position: [number, number]; // [col, row]
}

interface TransitioningImage extends PlacedImage {
  transitionState?: 'stable' | 'entering' | 'exiting';
}

const LegoGallery: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryType | 'All'>('All');
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const [placedImages, setPlacedImages] = useState<PlacedImage[]>([]);
  const [transitioningImages, setTransitioningImages] = useState<TransitioningImage[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [gridHeight, setGridHeight] = useState(10);
  const [imagesMeta, setImagesMeta] = useState<ImageMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

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
          // console.log('Images chargées depuis l\'API:', data.length, 'images'); // Debug
          // console.log('Détail des images:', data); // Debug
          // Filtrer seulement les images sélectionnées et les trier par position selon la catégorie courante
          const selectedImages = data
            .filter(img => img.selected)
            .sort((a, b) => {
              // Si une catégorie spécifique est sélectionnée, trier par position de cette catégorie
              if (activeCategory !== 'All') {
                return getPositionForCategory(a, activeCategory) - getPositionForCategory(b, activeCategory);
              }
              // Sinon, utiliser une position globale (moyenne ou première catégorie)
              const posA = typeof a.position === 'number' ? a.position : getPositionForCategory(a, 'Theater');
              const posB = typeof b.position === 'number' ? b.position : getPositionForCategory(b, 'Theater');
              return posA - posB;
            });
          // console.log('Images sélectionnées:', selectedImages.length, 'images'); // Debug
          // console.log('Catégories trouvées:', [...new Set(selectedImages.map(img => img.category))]); // Debug
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
  }, [API_URL, PROJECT_ID, activeCategory]);

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
    displayDimensions: meta.displayDimensions,
    cropData: meta.cropData
  }));

  // Calculer le crop optimal pour un format 1x1 (carré centré en haut à gauche)
  const calculateOptimalSquareCrop = (item: GalleryItem): { x: number; y: number; size: number } => {
    // Si l'image a déjà un crop défini et qu'elle est déjà carrée, la garder
    if (item.crop && item.dimension && item.dimension[0] === 1 && item.dimension[1] === 1) {
      return item.crop;
    }

    // Pour calculer le plus grand carré possible, on se base sur les displayDimensions
    const dims = item.displayDimensions || { cropWidthPercent: 100, cropHeightPercent: 100 };
    
    // Prendre la plus petite dimension pour faire un carré
    const minDimension = Math.min(dims.cropWidthPercent, dims.cropHeightPercent);
    
    // Le crop doit commencer en haut à gauche (0, 0) avec la taille du plus petit côté
    return {
      x: 0,
      y: 0,
      size: minDimension
    };
  };

  // Calculer les displayDimensions pour un carré
  const calculateSquareDisplayDimensions = (item: GalleryItem): { cropWidthPercent: number; cropHeightPercent: number } => {
    const dims = item.displayDimensions || { cropWidthPercent: 100, cropHeightPercent: 100 };
    const minDimension = Math.min(dims.cropWidthPercent, dims.cropHeightPercent);
    
    return {
      cropWidthPercent: minDimension,
      cropHeightPercent: minDimension
    };
  };

  // Algorithme de placement séquentiel sans trous
  const generateLayout = (items: GalleryItem[]) => {
    const GRID_WIDTH = 3;
    const placed: PlacedImage[] = [];
    
    // Grille dynamique qui grandit au besoin
    let grid: number[][] = [];

    items.forEach((item, index) => {
      // console.log(`\nPlacement image ${index + 1}: ${item.category}`);
      
      // Utiliser la dimension de l'API ou par défaut [1, 1]
      const targetDimension: [number, number] = item.dimension || [1, 1];
      // console.log(`Dimension de l'API: ${targetDimension[0]}x${targetDimension[1]}`);
      
      // Trouver la prochaine position libre (de gauche à droite, haut en bas)
      const nextPosition = findNextFreePosition(grid, GRID_WIDTH);
      // console.log(`Position de départ trouvée: [${nextPosition[0]}, ${nextPosition[1]}]`);
      
      // Essaie d'abord la dimension de l'API, puis fallback automatique vers 1x1
      const dimensionsToTry: [number, number][] = [];
      
      // Ajouter la dimension de l'API en premier
      dimensionsToTry.push(targetDimension);
      
      // Si la dimension de l'API n'est pas 1x1, ajouter 1x1 comme fallback automatique
      if (targetDimension[0] !== 1 || targetDimension[1] !== 1) {
        dimensionsToTry.push([1, 1]);
      }
      
      let placedSuccessfully = false;
      let usedDimension: [number, number] = targetDimension;
      let adjustedItem = item; // Copie de l'item qui peut être modifiée
      
      for (const dimension of dimensionsToTry) {
        const [width, height] = dimension;
        
        // Vérifier si cette dimension peut être placée à la position
        if (canPlaceAtPosition(grid, nextPosition, [width, height], GRID_WIDTH)) {
          // console.log(`✓ Dimension ${width}x${height} convient`);
          
          // Si on utilise le fallback 1x1, ajuster le crop et les displayDimensions
          if (dimension !== targetDimension && width === 1 && height === 1) {
            console.log(`Image ${index + 1} (${item.titre}): dimension ${targetDimension[0]}x${targetDimension[1]} impossible, fallback vers 1x1 avec crop optimisé`);
            
            // Créer une copie de l'item avec le crop optimisé pour un carré
            adjustedItem = {
              ...item,
              crop: calculateOptimalSquareCrop(item),
              displayDimensions: calculateSquareDisplayDimensions(item)
            };
          }
          
          // Étendre la grille si nécessaire
          extendGridIfNeeded(grid, nextPosition, [width, height], GRID_WIDTH);
          
          // Marquer les cases comme occupées
          markGridCells(grid, nextPosition, [width, height], 1);
          
          // Ajouter l'image placée (avec l'item ajusté si nécessaire)
          placed.push({
            item: adjustedItem,
            dimension: [width, height],
            position: nextPosition
          });
          
          usedDimension = [width, height];
          
          // console.log(`Image placée: ${width}x${height} à [${nextPosition[0]}, ${nextPosition[1]}]`);
          placedSuccessfully = true;
          break;
        } else {
          // console.log(`✗ Dimension ${width}x${height} ne convient pas`);
        }
      }
      
      if (!placedSuccessfully) {
        console.error(`Impossible de placer l'image ${index + 1}`);
      }
    });

    // Calculer la hauteur finale de la grille et la retourner
    const finalGridHeight = grid.length;
    // console.log(`Grille finale: ${GRID_WIDTH}x${finalGridHeight}`);
    
    return { placed, gridHeight: finalGridHeight };
  };

  // Trouver la prochaine position libre (balayage de gauche à droite, haut en bas)
  const findNextFreePosition = (grid: number[][], gridWidth: number): [number, number] => {
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
  const canPlaceAtPosition = (grid: number[][], [col, row]: [number, number], [width, height]: [number, number], gridWidth: number): boolean => {
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
  const extendGridIfNeeded = (grid: number[][], [col, row]: [number, number], [width, height]: [number, number], gridWidth: number) => {
    const requiredHeight = row + height;
    
    // Ajouter des lignes si nécessaire
    while (grid.length < requiredHeight) {
      grid.push(Array(gridWidth).fill(0));
    }
  };

  // Marquer les cases de la grille comme occupées ou libres
  const markGridCells = (grid: number[][], [col, row]: [number, number], [width, height]: [number, number], value: number) => {
    for (let r = row; r < row + height; r++) {
      for (let c = col; c < col + width; c++) {
        if (grid[r] && grid[r][c] !== undefined) {
          grid[r][c] = value;
        }
      }
    }
  };

  // Gérer les transitions lors du changement de filtre
  const handleFilterTransition = (newLayout: PlacedImage[], newGridHeight: number) => {
    setIsTransitioning(true);
    
    // Toutes les nouvelles images apparaissent avec l'animation d'entrée
    const transitionImages: TransitioningImage[] = newLayout.map(placedImage => ({
      ...placedImage,
      transitionState: 'entering'
    }));
    
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

    const filteredItems = activeCategory === 'All' 
      ? galleryItems 
      : galleryItems.filter(item => imageMatchesCategory(item.category, activeCategory));
    
    // console.log(`Filtrage pour catégorie "${activeCategory}":`, filteredItems.length, 'images sur', galleryItems.length, 'total'); // Debug
    
    const { placed, gridHeight: newGridHeight } = generateLayout(filteredItems);
    handleFilterTransition(placed, newGridHeight);
  }, [activeCategory, imagesMeta]); // Ajouter imagesMeta comme dépendance

  // Intersection Observer (commenté pour l'instant)
  useEffect(() => {
    return () => {
      itemRefs.current.forEach((ref) => {
        if (ref) {
          // observer.unobserve(ref);
        }
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-white font-serif p-0 m-0">
      {/* Header */}
      <PortfolioHeader showHome={false} />

      {/* Category Navigation */}
      <nav className="font-exposure flex justify-between px-8 pt-12 bg-transparent w-full max-w-[1152px] mx-auto"
      style={{
            gridTemplateRows: `repeat(${gridHeight}, 400px)`,
            fontFamily: 'ExposureTrial',
      }}
      >
        {categories.map((category) => (
          <button
            key={category}
            className={`
              bg-none border-none text-xl text-black cursor-pointer 
               py-2 font-[400] tracking-wide relative text-center w-[50px] md:w-[90px]
              hover:font-[600] transition-opacity duration-200
              ${activeCategory === category ? 'font-[600]' : ''}
            `}
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

      {/* Dynamic Lego Gallery Grid */}
      {!loading && galleryItems.length > 0 && (
        <div 
          className="grid grid-cols-3 gap-2 p-8 pt-2 mx-auto auto-rows-[400px]"
          style={{ 
            gridTemplateRows: `repeat(${gridHeight}, 400px)`,
            width: '1152px', // Largeur fixe pour éviter les variations
            maxWidth: '100vw' // Ne pas dépasser la largeur de l'écran
          }}
        >
          {(isTransitioning ? transitioningImages : placedImages).map((placedImage, index) => (
            <ImageComponent
              key={placedImage.item.id}
              item={placedImage.item}
              dimension={placedImage.dimension}
              position={placedImage.position}
              index={index}
              onImageRef={(idx, el) => { itemRefs.current[idx] = el; }}
              isVisible={visibleItems.includes(index)}
              crop={placedImage.item.crop}
              displayDimensions={placedImage.item.displayDimensions}
              transitionState={isTransitioning ? (placedImage as TransitioningImage).transitionState : 'stable'}
            />
          ))}
        </div>
      )}

      {/* Global font-face and utility class for ExposureTrial */}
      <style jsx global>{`
        @font-face {
          font-family: 'ExposureTrial';
          src: url('/ExposureTrial-0.woff2') format('woff2');
          font-weight: normal;
          font-style: normal;
        }
        .font-exposure {
          font-family: 'ExposureTrial', ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
        }
      `}</style>
    </div>
  );
};

export default LegoGallery;
