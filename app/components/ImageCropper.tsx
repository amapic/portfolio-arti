"use client";

import React, { useState, useRef, useEffect } from 'react';

interface CropArea {
  x: number;
  y: number;
  size: number;
}

interface ImageCropperProps {
  imageUrl: string;
  dimension: [number, number];
  initialCrop?: CropArea;
  onCropChange: (crop: CropArea) => void;
  onDimensionChange?: (dimension: [number, number]) => void;
  // notify parent of the current display dimensions of the crop box
  onDisplayChange?: (displayDimensions: { cropWidthPercent: number; cropHeightPercent: number }) => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  imageUrl,
  dimension,
  initialCrop,
  onCropChange,
  onDimensionChange,
  onDisplayChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropArea, setCropArea] = useState<CropArea>(
    initialCrop || { x: 0, y: 0, size: 100 }
  );
  const [cropSize, setCropSize] = useState<number>(initialCrop?.size || 100);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [displayDimensions, setDisplayDimensions] = useState({ cropWidthPercent: 50, cropHeightPercent: 50 });

  // Charger les dimensions réelles de l'image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Calculer le ratio d'aspect selon la dimension choisie
  const getAspectRatio = () => {
    const [w, h] = dimension;
    return w / h;
  };

  // Calculer les dimensions du cadre de recadrage basées sur le pourcentage et le format
  const getCropDimensions = (sizePercent: number = cropArea.size) => {
    if (!containerRef.current || !imageDimensions) return { width: 100, height: 100 };
    
    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;
    const cropAspectRatio = getAspectRatio(); // Ratio du format choisi (2x1, 1x2, 1x1)
    const containerAspectRatio = containerWidth / containerHeight; // Ratio de l'image affichée
    
    let maxCropWidth, maxCropHeight;
    
    // Calculer la taille maximale possible du cadre en respectant le ratio choisi
    if (cropAspectRatio > containerAspectRatio) {
      // Le cadre est plus large que l'image : la largeur du container limite
      maxCropWidth = containerWidth;
      maxCropHeight = maxCropWidth / cropAspectRatio;
    } else {
      // Le cadre est plus haut que l'image : la hauteur du container limite
      maxCropHeight = containerHeight;
      maxCropWidth = maxCropHeight * cropAspectRatio;
    }
    
    // Appliquer le pourcentage à la taille maximale
    const cropWidth = (maxCropWidth * sizePercent) / 100;
    const cropHeight = (maxCropHeight * sizePercent) / 100;
    
    return { width: cropWidth, height: cropHeight };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const { width: cropWidth, height: cropHeight } = getCropDimensions();
    
    const newX = ((e.clientX - rect.left) / rect.width) * 100;
    const newY = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Limiter les déplacements pour que le cadre reste dans l'image
    const maxX = 100 - (cropWidth / rect.width) * 100;
    const maxY = 100 - (cropHeight / rect.height) * 100;
    
    const constrainedX = Math.max(0, Math.min(newX - (cropWidth / rect.width) * 50, maxX));
    const constrainedY = Math.max(0, Math.min(newY - (cropHeight / rect.height) * 50, maxY));
    
    const newCrop = {
      x: constrainedX,
      y: constrainedY,
      size: cropArea.size
    };
    
    setCropArea(newCrop);
    onCropChange(newCrop);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove as any);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove as any);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Recalculer le cadre de recadrage quand la dimension change ou quand les dimensions de l'image sont chargées
  useEffect(() => {
    if (!containerRef.current || !imageDimensions) return;
    
    // Si on a un initialCrop, on garde ses coordonnées, sinon on centre
    const newCrop = {
      x: initialCrop ? initialCrop.x : Math.max(0, Math.min(25, 50)),
      y: initialCrop ? initialCrop.y : Math.max(0, Math.min(25, 50)),
      size: cropArea.size
    };
    
    setCropArea(newCrop);
    onCropChange(newCrop);
    
    // Forcer le re-render pour recalculer les dimensions d'affichage
    const timer = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.style.transform = 'translateZ(0)'; // Force repaint
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, [dimension, imageDimensions]); // Se déclenche quand dimension change ou quand les dimensions de l'image sont chargées

  // Synchroniser la taille du curseur avec les changements du cropArea
  useEffect(() => {
    setCropSize(cropArea.size);
  }, [cropArea.size, dimension, imageDimensions]);

  // Mettre à jour les dimensions d'affichage quand les paramètres changent
  useEffect(() => {
    if (containerRef.current && imageDimensions) {
      const dims = getCropDisplayDimensions();
      setDisplayDimensions(dims);
      if (onDisplayChange) {
        onDisplayChange(dims);
      }
    }
  }, [cropArea, dimension, imageDimensions]);

  const dimensions = [
    { label: '1x1 (Carré)', value: [1, 1] as [number, number] },
    { label: '2x1 (Rectangle horizontal)', value: [2, 1] as [number, number] },
    { label: '1x2 (Rectangle vertical)', value: [1, 2] as [number, number] }
  ];

  const handleDimensionChange = (newDimension: [number, number]) => {
    if (onDimensionChange) {
      onDimensionChange(newDimension);
    }
  };

  // Fonction pour mettre à jour la taille du cadre via le curseur
  const handleSizeChange = (newSize: number) => {
    setCropSize(newSize);
    
    const newCrop = {
      x: cropArea.x,
      y: cropArea.y,
      size: newSize
    };
    
    setCropArea(newCrop);
    onCropChange(newCrop);
  };

  // Fonction pour calculer les dimensions d'affichage du cadre en pourcentage du container
  const getCropDisplayDimensions = () => {
    if (!containerRef.current || !imageDimensions) {
      // Valeurs par défaut sécurisées quand le container n'est pas encore disponible
      return { cropWidthPercent: 50, cropHeightPercent: 50 };
    }
    
    const { width: cropWidth, height: cropHeight } = getCropDimensions();
    // Maintenant l'image remplit exactement le container, donc on peut diviser directement
    const cropWidthPercent = (cropWidth / containerRef.current.offsetWidth) * 100;
    const cropHeightPercent = (cropHeight / containerRef.current.offsetHeight) * 100;
    return { cropWidthPercent, cropHeightPercent };
  };

  // Fonction pour calculer le backgroundSize et backgroundPosition corrects pour l'aperçu
  const getPreviewBackground = () => {
    // Utiliser l'état displayDimensions qui est mis à jour de manière sécurisée
    const { cropWidthPercent, cropHeightPercent } = displayDimensions;
    // Éviter la division par zéro et les valeurs trop petites
    const safeWidthPercent = Math.max(cropWidthPercent, 1);
    const safeHeightPercent = Math.max(cropHeightPercent, 1);
    // Facteur de zoom appliqué dans l'aperçu
    const bgSizeX = 100 / (safeWidthPercent / 100);
    const bgSizeY = 100 / (safeHeightPercent / 100);
    // Pour la position, il faut appliquer le même facteur
    const bgPosX = cropArea.x * (bgSizeX / 100);
    const bgPosY = cropArea.y * (bgSizeY / 100);
    return {
      backgroundSize: `${bgSizeX}% ${bgSizeY}%`,
      backgroundPosition: `${bgPosX}% ${bgPosY}%`
    };
  };

  // Fonction pour calculer la taille de fond pour l'aperçu du résultat
  const getPreviewBackgroundSize = () => {
    const { cropWidthPercent, cropHeightPercent } = displayDimensions;
    const safeWidthPercent = Math.max(cropWidthPercent, 1);
    const safeHeightPercent = Math.max(cropHeightPercent, 1);
    const bgSizeX = 100 / (safeWidthPercent / 100);
    const bgSizeY = 100 / (safeHeightPercent / 100);
    return `${bgSizeX}% ${bgSizeY}%`;
  };

  return (
    <div className="space-y-4">
      {/* Styles CSS pour le slider */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
      
      {/* Sélecteur de format */}
      {onDimensionChange && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Format d'affichage
          </label>
          <div className="grid grid-cols-3 gap-2">
            {dimensions.map((dim) => (
              <button
                key={`${dim.value[0]}x${dim.value[1]}`}
                onClick={() => handleDimensionChange(dim.value)}
                className={`p-2 text-sm border rounded-md transition-colors ${
                  dimension[0] === dim.value[0] && dimension[1] === dim.value[1]
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {dim.label}
              </button>
            ))}
          </div>
          
          {/* Contrôle de taille */}
          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-500">10%</span>
            <input
              type="range"
              min="10"
              max="100"
              value={cropSize}
              onChange={(e) => handleSizeChange(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${cropSize}%, #e5e7eb ${cropSize}%, #e5e7eb 100%)`
              }}
            />
            <span className="text-xs text-gray-500">100%</span>
          </div>
          
          <p className="text-xs text-gray-500">
            Ajustez la taille du cadre de recadrage par rapport à l'image originale
          </p>
          
          {/* Aperçu miniature supprimé, on ne garde que l'aperçu du résultat plus bas */}
        </div>
      )}
      
      <div className="text-sm text-gray-600">
        Format sélectionné: {dimension[0]}×{dimension[1]} - Glissez le cadre pour recadrer
      </div>
      
      <div 
        ref={containerRef}
        className="relative bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden mx-auto"
        style={{ 
          maxWidth: '500px', 
          maxHeight: '400px',
          aspectRatio: imageDimensions ? `${imageDimensions.width} / ${imageDimensions.height}` : '1'
        }}
        onMouseMove={handleMouseMove}
      >
        {/* Image de fond */}
        <img
          src={imageUrl}
          alt="Image à recadrer"
          className="w-full h-full object-cover"
          draggable={false}
        />
        
        {/* Overlay sombre */}
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        
        {/* Cadre de recadrage */}
        <div
          className="absolute border-2 border-blue-500 bg-transparent cursor-move"
          style={{
            left: `${cropArea.x}%`,
            top: `${cropArea.y}%`,
            width: `${displayDimensions.cropWidthPercent}%`,
            height: `${displayDimensions.cropHeightPercent}%`,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
          }}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute inset-0 border border-white border-opacity-50" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs bg-blue-500 px-2 py-1 rounded">
            Déplacer
          </div>
        </div>
      </div>
      
      {/* Aperçu du résultat */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">Aperçu du résultat :</div>
        <div 
          className="border border-gray-300 rounded overflow-hidden"
          style={{ 
            width: `${Math.min(200, 200 * getAspectRatio())}px`,
            height: `${Math.min(200, 200 / getAspectRatio())}px`
          }}
        >
          <div
            className="w-full h-full bg-cover bg-no-repeat"
            style={{
              backgroundImage: `url(${imageUrl})`,
              // Calcul du ratio entre la taille affichée de la 2e image (container) et celle de l'aperçu
              ...(() => {
                if (!containerRef.current) return { backgroundPosition: `${cropArea.x}% ${cropArea.y}%` };
                const containerW = containerRef.current.offsetWidth;
                const containerH = containerRef.current.offsetHeight;
                // Taille de l'aperçu (3e image)
                const previewW = Math.min(200, 200 * getAspectRatio());
                const previewH = Math.min(200, 200 / getAspectRatio());
                // Ratio d'échelle entre container et aperçu
                const ratioX = containerW / previewW;
                const ratioY = containerH / previewH;
                // Adapter la position du crop
                const posX = cropArea.x / ratioX;
                const posY = cropArea.y / ratioY;
                // console.log(`imageDimensions: ${imageDimensions.width} ${imageDimensions.height}`);
                // console.log(`AA: ${ratioX}% ${ratioY}%`);
                // console.log(previewW, previewH,containerH,containerW);
                // console.log(`Crop position: ${posX}% ${posY}%`);
                console.log(`cropArea.x: ${cropArea.x}, cropArea.y: ${cropArea.y}`);
                console.log(`displayDimensions: ${displayDimensions.cropWidthPercent}% ${displayDimensions.cropHeightPercent}%`);
                return { backgroundPosition: `${cropArea.x*((100/100)+displayDimensions.cropWidthPercent/100)}% ${cropArea.y*((100/100)+displayDimensions.cropHeightPercent/100)}%` };
              })(),
              backgroundSize: getPreviewBackgroundSize()
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;