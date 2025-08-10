"use client";

import React, { useState } from "react";

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

interface ImageComponentProps {
  item: GalleryItem;
  dimension: [number, number];
  index: number;
  crop?: {
    x: number;
    y: number;
    size: number;
  };
  displayDimensions?: {
    cropWidthPercent: number;
    cropHeightPercent: number;
  };
  isForcedSquare?: boolean;
}

const ImageComponent_new: React.FC<ImageComponentProps> = ({
  item,
  dimension,
  index,
  crop,
  displayDimensions,
  isForcedSquare,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  // Calculer l'aspect ratio pour la hauteur
  const getImageHeight = () => {
    const [width, height] = dimension;
    
    // Pour Isotope, nous utilisons un aspect ratio basé sur les dimensions
    if (width === 2 && height === 1) {
      // 2x1: ratio plus large, hauteur plus petite
      return "200px";
    } else if (width === 1 && height === 2) {
      // 1x2: ratio plus haut, hauteur plus grande
      return "400px";
    } else {
      // 1x1: carré standard
      return "200px";
    }
  };

  // Style de crop pour l'image de fond
  const getCropStyle = () => {
    if (!crop && !item.cropData) {
      return {
        backgroundImage: `url(${item.imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
    }

    // Utiliser cropData si disponible (plus précis)
    if (item.cropData) {
      const { originalWidth, originalHeight, cropX, cropY, cropWidth, cropHeight } = item.cropData;
      
      // Calculer les pourcentages pour background-position et background-size
      const bgSizeX = (originalWidth / cropWidth) * 100;
      const bgSizeY = (originalHeight / cropHeight) * 100;
      const bgPosX = (cropX / (originalWidth - cropWidth)) * 100;
      const bgPosY = (cropY / (originalHeight - cropHeight)) * 100;

      return {
        backgroundImage: `url(${item.imageUrl})`,
        backgroundSize: `${bgSizeX}% ${bgSizeY}%`,
        backgroundPosition: `${isNaN(bgPosX) ? 50 : bgPosX}% ${isNaN(bgPosY) ? 50 : bgPosY}%`,
        backgroundRepeat: "no-repeat",
      };
    }

    // Utiliser crop classique en fallback
    if (crop) {
      const scale = 100 / crop.size;
      const translateX = -crop.x * scale;
      const translateY = -crop.y * scale;

      return {
        backgroundImage: `url(${item.imageUrl})`,
        backgroundSize: `${scale * 100}%`,
        backgroundPosition: `${translateX}% ${translateY}%`,
        backgroundRepeat: "no-repeat",
      };
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
    <div
      className="relative overflow-hidden transition-all duration-300 ease-out cursor-pointer group"
      style={{
        width: "100%",
        height: getImageHeight(),
        ...getCropStyle(),
      }}
      onMouseEnter={() => setShowOverlay(true)}
      onMouseLeave={() => setShowOverlay(false)}
    >
      {/* Image pour le preload - visible mais transparente */}
      <img
        src={item.imageUrl}
        alt={item.alt}
        className="absolute inset-0 w-full h-full object-cover opacity-0"
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageLoaded(true)} // Masquer le loader même en cas d'erreur
        loading="lazy"
      />

      {/* Overlay avec titre et sous-titre */}
      <div
        className={`absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-end p-4 transition-opacity duration-300 ${
          showOverlay ? "opacity-100" : "opacity-0"
        }`}
      >
        <h3 className="text-white text-lg font-semibold mb-1 font-serif">
          {item.titre}
        </h3>
        {item.sousTitre && (
          <p className="text-white text-sm opacity-90 font-serif">
            {item.sousTitre}
          </p>
        )}
        
        {/* Indicateur d'image forcée en 1x1 */}
        {isForcedSquare && (
          <div className="absolute top-2 right-2">
            <span className="text-red-500 text-xs font-bold bg-white bg-opacity-20 px-2 py-1 rounded">
              Forcé 1x1
            </span>
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default ImageComponent_new;
