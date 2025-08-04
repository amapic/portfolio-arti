import React, { useEffect } from 'react';
import { CategoryType } from '../types/categories';

interface ImageComponentProps {
  item: {
    id: string;
    category: CategoryType | CategoryType[];
    imageUrl: string;
    alt: string;
    titre: string;
    sousTitre: string;
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
  };
  dimension: [number, number];
  position: [number, number];
  index: number;
  onImageRef: (index: number, el: HTMLDivElement | null) => void;
  isVisible: boolean;
  crop?: {
    x: number;
    y: number;
    size: number;
  };
  displayDimensions?: {
    cropWidthPercent: number;
    cropHeightPercent: number;
  };
  transitionState?: 'stable' | 'entering' | 'exiting';
}

const ImageComponent: React.FC<ImageComponentProps> = ({
  item,
  dimension,
  position,
  index,
  onImageRef,
  isVisible,
  crop,
  displayDimensions,
  transitionState = 'stable'
}) => {
  const [width, height] = dimension;
  const [col, row] = position;

  // Classes Tailwind pour les dimensions
  const getGridClasses = () => {
    const colSpan = width === 1 ? 'col-span-1' : 'col-span-2';
    const rowSpan = height === 1 ? 'row-span-1' : 'row-span-2';
    return `${colSpan} ${rowSpan}`;
  };

  // Style pour la position absolue dans la grille
  const gridStyle = {
    gridColumn: `${col + 1} / span ${width}`,
    gridRow: `${row + 1} / span ${height}`
  };

  // Style pour le crop de l'image (sans zoom/size)
  const getImageStyle = () => {
    if (!crop) {
      return {};
    }

    // Utiliser les nouvelles données absolues si disponibles
    if (item.cropData) {
      const { originalWidth, originalHeight, cropX, cropY, cropWidth, cropHeight } = item.cropData;
      
      // Calculer les pourcentages basés sur l'image originale
      const bgSizeX = (originalWidth / cropWidth) * 100;
      const bgSizeY = (originalHeight / cropHeight) * 100;
      const bgPosX = (cropX / cropWidth) * 100;
      const bgPosY = (cropY / cropHeight) * 100;
      
      return {
        backgroundImage: `url(${item.imageUrl})`,
        backgroundSize: `${bgSizeX}% ${bgSizeY}%`,
        backgroundPosition: `${bgPosX}% ${bgPosY}%`,
        backgroundRepeat: 'no-repeat'
      };
    }

    // Fallback simplifié (sans zoom/size) pour compatibilité
    const dims = displayDimensions || item.displayDimensions || { cropWidthPercent: 100, cropHeightPercent: 100 };
    const safeW = Math.max(dims.cropWidthPercent, 1);
    const safeH = Math.max(dims.cropHeightPercent, 1);
    
    // Calcul simplifié sans facteur de zoom
    const bgSizeX = 100 / (safeW / 100);
    const bgSizeY = 100 / (safeH / 100);
    const bgPosX = crop.x;
    const bgPosY = crop.y;
    
    return {
      backgroundImage: `url(${item.imageUrl})`,
      backgroundSize: `${bgSizeX}% ${bgSizeY}%`,
      backgroundPosition: `${bgPosX}% ${bgPosY}%`,
      backgroundRepeat: 'no-repeat'
    };
  };

  const shouldUseBackground = Boolean(crop);
  // console.log("crop",shouldUseBackground);
  // Classes CSS pour les transitions
  const getTransitionClasses = () => {
    switch (transitionState) {
      case 'entering':
        return 'entering-animation';
      case 'exiting':
        return 'exiting-animation';
      default:
        return '';
    }
  };

  useEffect(() => {
    console.log(item.category);
    console.log('ImageComponent props:', { item, dimension, position, index, isVisible, crop, displayDimensions, transitionState });
    // Logique d'effet secondaire ici
  }, []);

  return (
    <>
      {/* Animation CSS pour les transitions */}
      <style jsx>{`
        @keyframes scaleIn {
          from { 
            transform: scale(0);
            opacity: 0;
          }
          to { 
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes scaleOut {
          from { 
            transform: scale(1);
            opacity: 1;
          }
          to { 
            transform: scale(0);
            opacity: 0;
          }
        }
        
        .entering-animation {
          animation: scaleIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .exiting-animation {
          animation: scaleOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
      
      <div 
        ref={(el) => onImageRef(index, el)}
        data-index={index}
        className={`
          relative overflow-hidden shadow-sm 
          cursor-pointer group
          ${isVisible ? 'animate-pulse' : ''}
          ${getGridClasses()}
          ${getTransitionClasses()}
        `}
        style={gridStyle}
      >
      {shouldUseBackground ? (
        // Utiliser un div avec background-image pour le crop
        <div
          className="w-full h-full"
          style={getImageStyle()}
        />
      ) : (
        // Image normale sans crop
        <img
          src={item.imageUrl}
          alt={item.alt}
          className="w-full h-full object-cover"
          loading="eager"
        />
      )}
      
      {/* Titre et sous-titre centrés au hover, sans animation */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"
        style={{ zIndex: 2 }}
      >
        <h3 className="text-white text-lg font-semibold tracking-wider drop-shadow-lg text-center">
          {item.titre}
        </h3>
        {item.sousTitre && (
          <p className="text-white text-sm mt-1 opacity-90 font-light drop-shadow-lg text-center">
            {item.sousTitre}
          </p>
        )}
      </div>
    </div>
    </>
  );
};

export default ImageComponent;
