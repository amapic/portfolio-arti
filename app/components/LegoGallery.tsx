"use client";

import React, { useState, useEffect, useRef } from 'react';
import ImageComponent from './ImageComponent';
import PortfolioHeader from './PortfolioHeader';
// import PortfolioFooter from './PortfolioFooter';
import { ImageMeta } from '../types/imageMeta';
import { CATEGORIES, CategoryType, getCategoryLabel } from '../types/categories';

interface GalleryItem {
  id: number;
  category: string;
  imageUrl: string;
  alt: string;
  titre: string;
  sousTitre: string;
  dimension?: [number, number]; // Dimension optionnelle depuis l'API
}

interface PlacedImage {
  item: GalleryItem;
  dimension: [number, number]; // [width, height]
  position: [number, number]; // [col, row]
}

const LegoGallery: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryType | 'All'>('All');
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const [placedImages, setPlacedImages] = useState<PlacedImage[]>([]);
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
          console.log('Images chargées depuis l\'API:', data.length, 'images'); // Debug
          console.log('Détail des images:', data); // Debug
          // Filtrer seulement les images sélectionnées et les trier par position
          const selectedImages = data
            .filter(img => img.selected)
            .sort((a, b) => a.position - b.position);
          console.log('Images sélectionnées:', selectedImages.length, 'images'); // Debug
          console.log('Catégories trouvées:', [...new Set(selectedImages.map(img => img.category))]); // Debug
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
    id: parseInt(meta.id.replace('img_', '') || '0'), // Convertir l'ID string en number
    category: meta.category,
    imageUrl: meta.image_url,
    alt: meta.alt,
    titre: meta.titre || '',
    sousTitre: meta.sousTitre || ''
    // Note: dimension ignorée pour l'instant - l'algorithme choisit aléatoirement
  }));

  // Algorithme de placement séquentiel sans trous
  const generateLayout = (items: GalleryItem[]) => {
    const GRID_WIDTH = 3;
    const placed: PlacedImage[] = [];
    
    // Grille dynamique qui grandit au besoin
    let grid: number[][] = [];
    
    // Dimensions possibles par ordre de priorité (éviter 1x1 si possible)
    const dimensionPriority: [number, number][] = [
      [2, 1], // Rectangle horizontal (priorité 1)
      [1, 2], // Rectangle vertical (priorité 2)  
      [1, 1]  // Carré (dernier recours)
    ];

    items.forEach((item, index) => {
      console.log(`\nPlacement image ${index + 1}: ${item.category}`);
      
      // Trouver la prochaine position libre (de gauche à droite, haut en bas)
      const nextPosition = findNextFreePosition(grid, GRID_WIDTH);
      console.log(`Position de départ trouvée: [${nextPosition[0]}, ${nextPosition[1]}]`);
      
      // Essayer les dimensions par ordre de priorité
      let placedSuccessfully = false;
      
      for (const dimension of dimensionPriority) {
        const [width, height] = dimension;
        
        // Vérifier si cette dimension peut être placée à la position
        if (canPlaceAtPosition(grid, nextPosition, [width, height], GRID_WIDTH)) {
          console.log(`✓ Dimension ${width}x${height} convient`);
          
          // Étendre la grille si nécessaire
          extendGridIfNeeded(grid, nextPosition, [width, height], GRID_WIDTH);
          
          // Marquer les cases comme occupées
          markGridCells(grid, nextPosition, [width, height], 1);
          
          // Ajouter l'image placée
          placed.push({
            item,
            dimension: [width, height],
            position: nextPosition
          });
          
          console.log(`Image placée: ${width}x${height} à [${nextPosition[0]}, ${nextPosition[1]}]`);
          placedSuccessfully = true;
          break;
        } else {
          console.log(`✗ Dimension ${width}x${height} ne convient pas`);
        }
      }
      
      if (!placedSuccessfully) {
        console.error(`Impossible de placer l'image ${index + 1}`);
      }
    });

    // Calculer la hauteur finale de la grille
    setGridHeight(grid.length);
    console.log(`Grille finale: ${GRID_WIDTH}x${grid.length}`);
    
    return placed;
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

  // Générer le layout quand les items changent
  useEffect(() => {
    // Ne générer le layout que si on a des images de l'API
    if (galleryItems.length === 0) {
      setPlacedImages([]);
      return;
    }

    const filteredItems = activeCategory === 'All' 
      ? galleryItems 
      : galleryItems.filter(item => item.category === activeCategory);
    
    console.log(`Filtrage pour catégorie "${activeCategory}":`, filteredItems.length, 'images sur', galleryItems.length, 'total'); // Debug
    
    const layout = generateLayout(filteredItems);
    setPlacedImages(layout);
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
      <PortfolioHeader />

      {/* Category Navigation */}
      <nav className="flex justify-center gap-12 pt-12 bg-transparent">
        {categories.map((category) => (
          <button
            key={category}
            className={`
              bg-none border-none text-xl font-light text-black opacity-70 cursor-pointer 
              px-4 py-2 tracking-wide font-serif relative text-center w-[50px] md:w-[90px]
              hover:opacity-100 transition-opacity duration-200
              ${activeCategory === category ? 'font-semibold opacity-100' : ''}
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <span className="ml-4 text-black opacity-70">Chargement des images...</span>
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
          className="grid grid-cols-3 gap-2 p-8 pt-2 max-w-6xl mx-auto auto-rows-[400px]"
          style={{ gridTemplateRows: `repeat(${gridHeight}, 400px)` }}
        >
          {placedImages.map((placedImage, index) => (
            <ImageComponent
              key={placedImage.item.id}
              item={placedImage.item}
              dimension={placedImage.dimension}
              position={placedImage.position}
              index={index}
              onImageRef={(idx, el) => { itemRefs.current[idx] = el; }}
              isVisible={visibleItems.includes(index)}
            />
          ))}
        </div>
      )}

      {/* <PortfolioFooter /> */}
    </div>
  );
};

export default LegoGallery;
