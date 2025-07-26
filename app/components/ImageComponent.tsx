import React from 'react';
import { CategoryType } from '../types/categories';

interface ImageComponentProps {
  item: {
    id: string; // Changer en string pour éviter la troncature
    category: CategoryType | CategoryType[];
    imageUrl: string;
    alt: string;
    titre: string;
    sousTitre: string;
  };
  dimension: [number, number]; // [width, height] en unités de grille
  position: [number, number]; // [col, row] position dans la grille
  index: number;
  onImageRef: (index: number, el: HTMLDivElement | null) => void;
  isVisible: boolean;
  crop?: {
    x: number;      // position X du cadre (en %)
    y: number;      // position Y du cadre (en %)
    size: number;   // taille du cadre (en %)
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

  // Style pour le crop de l'image
  const getImageStyle = () => {
    if (!crop) {
      return {};
    }
    
    // Logique cohérente avec ImageCropper - calcul basé sur la dimension limitante
    const [cropRatioW, cropRatioH] = dimension;
    const cropAspectRatio = cropRatioW / cropRatioH;
    
    // Pour calculer les dimensions du crop, on doit déterminer quelle dimension limite
    // On suppose que l'image affichée a un ratio de 1:1 dans le container (object-cover)
    // et on calcule comme dans ImageCropper
    
    let maxCropWidthPercent, maxCropHeightPercent;
    
    // Calculer la taille maximale possible du cadre en respectant le ratio choisi
    // On assume que l'image remplit son container de manière proportionnelle
    if (cropAspectRatio >= 1) {
      // Format horizontal (2x1) ou carré (1x1)
      // La largeur est limitante ou égale
      maxCropWidthPercent = 100;
      maxCropHeightPercent = 100 / cropAspectRatio;
    } else {
      // Format vertical (1x2)
      // La hauteur est limitante
      maxCropHeightPercent = 100;
      maxCropWidthPercent = 100 * cropAspectRatio;
    }
    
    // Appliquer le pourcentage de size à la taille maximale
    const cropWidthPercent = (maxCropWidthPercent * crop.size) / 100;
    const cropHeightPercent = (maxCropHeightPercent * crop.size) / 100;
    
    // Calculer le background-size pour afficher la bonne portion
    const bgSizeX = 100 / (cropWidthPercent / 100);
    const bgSizeY = 100 / (cropHeightPercent / 100);
    
    // Calculer le background-position pour centrer le crop
    const bgPosX = -(crop.x * bgSizeX) / 100;
    const bgPosY = -(crop.y * bgSizeY) / 100;
    
    return {
      backgroundImage: `url(${item.imageUrl})`,
      backgroundSize: `${bgSizeX}% ${bgSizeY}%`,
      backgroundPosition: `${bgPosX}% ${bgPosY}%`,
      backgroundRepeat: 'no-repeat'
    };
  };

  const shouldUseBackground = Boolean(crop);

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
          cursor-pointer
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
      
      {/* Titre et sous-titre sans overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-white text-lg font-semibold tracking-wider drop-shadow-lg">
          {item.titre}
        </h3>
        {item.sousTitre && (
          <p className="text-white text-sm mt-1 opacity-90 font-light drop-shadow-lg">
            {item.sousTitre}
          </p>
        )}
      </div>
    </div>
    </>
  );
};

export default ImageComponent;
