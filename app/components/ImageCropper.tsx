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
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  imageUrl,
  dimension,
  initialCrop,
  onCropChange,
  onDimensionChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropArea, setCropArea] = useState<CropArea>(
    initialCrop || { x: 0, y: 0, size: 100 }
  );
  const [cropSize, setCropSize] = useState<number>(initialCrop?.size || 100);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

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
    const aspectRatio = getAspectRatio();
    
    // Calculer l'échelle d'affichage de l'image dans le container
    const imageAspectRatio = imageDimensions.width / imageDimensions.height;
    let displayWidth, displayHeight;
    
    if (imageAspectRatio > containerWidth / containerHeight) {
      // L'image est limitée par la largeur du container
      displayWidth = containerWidth;
      displayHeight = containerWidth / imageAspectRatio;
    } else {
      // L'image est limitée par la hauteur du container
      displayHeight = containerHeight;
      displayWidth = containerHeight * imageAspectRatio;
    }
    
    // La plus petite dimension de l'image réelle
    const smallestImageDimension = Math.min(imageDimensions.width, imageDimensions.height);
    
    // Calculer la taille de base du cadre : le plus grand côté du cadre = plus petite dimension de l'image
    const scaleToContainer = Math.min(displayWidth / imageDimensions.width, displayHeight / imageDimensions.height);
    const baseCropSizeInContainer = smallestImageDimension * scaleToContainer;
    
    // Appliquer le pourcentage de taille
    const actualCropSizeInContainer = (baseCropSizeInContainer * sizePercent) / 100;
    
    let cropWidth, cropHeight;
    
    if (aspectRatio > 1) {
      // Format horizontal (2x1) : la largeur est le côté le plus grand
      cropWidth = actualCropSizeInContainer;
      cropHeight = cropWidth / aspectRatio;
    } else if (aspectRatio < 1) {
      // Format vertical (1x2) : la hauteur est le côté le plus grand
      cropHeight = actualCropSizeInContainer;
      cropWidth = cropHeight * aspectRatio;
    } else {
      // Format carré (1x1) : les deux côtés sont égaux
      cropWidth = cropHeight = actualCropSizeInContainer;
    }
    
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
    const { width: cropWidth, height: cropHeight } = getCropDimensions();
    const cropWidthPercent = containerRef.current ? (cropWidth / containerRef.current.offsetWidth) * 100 : 50;
    const cropHeightPercent = containerRef.current ? (cropHeight / containerRef.current.offsetHeight) * 100 : 50;
    return { cropWidthPercent, cropHeightPercent };
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
        </div>
      )}
      
      {/* Curseur de taille du cadre */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Taille du cadre de sélection: {cropSize}%
        </label>
        <div className="flex items-center space-x-3">
          <span className="text-xs text-gray-500">0%</span>
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
      </div>
      
      <div className="text-sm text-gray-600">
        Format sélectionné: {dimension[0]}×{dimension[1]} - Glissez le cadre pour recadrer
      </div>
      
      <div 
        ref={containerRef}
        className="relative bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
        style={{ width: '400px', height: '300px' }}
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
            width: `${getCropDisplayDimensions().cropWidthPercent}%`,
            height: `${getCropDisplayDimensions().cropHeightPercent}%`,
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
              backgroundPosition: `${cropArea.x}% ${cropArea.y}%`,
              backgroundSize: `${100 / (getCropDisplayDimensions().cropWidthPercent / 100)}% ${100 / (getCropDisplayDimensions().cropHeightPercent / 100)}%`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
