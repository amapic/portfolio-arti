"use client";

import React, { useState, useRef, useEffect } from 'react';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
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
    initialCrop || { x: 25, y: 25, width: 50, height: 50 }
  );

  // Calculer le ratio d'aspect selon la dimension choisie
  const getAspectRatio = () => {
    const [w, h] = dimension;
    return w / h;
  };

  // Calculer les dimensions du cadre de recadrage
  const getCropDimensions = () => {
    if (!containerRef.current) return { width: 100, height: 100 };
    
    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;
    const aspectRatio = getAspectRatio();
    
    let cropWidth, cropHeight;
    
    if (aspectRatio > 1) {
      // Format horizontal (2x1)
      cropWidth = Math.min(containerWidth * 0.6, containerHeight * 0.8 * aspectRatio);
      cropHeight = cropWidth / aspectRatio;
    } else if (aspectRatio < 1) {
      // Format vertical (1x2)
      cropHeight = Math.min(containerHeight * 0.6, containerWidth * 0.8 / aspectRatio);
      cropWidth = cropHeight * aspectRatio;
    } else {
      // Format carré (1x1)
      const size = Math.min(containerWidth, containerHeight) * 0.5;
      cropWidth = cropHeight = size;
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
      width: (cropWidth / rect.width) * 100,
      height: (cropHeight / rect.height) * 100
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

  // Recalculer le cadre de recadrage quand la dimension change
  useEffect(() => {
    if (!containerRef.current) return;
    
    const { width: newCropWidth, height: newCropHeight } = getCropDimensions();
    const containerRect = containerRef.current;
    
    // Recalculer les dimensions en pourcentage pour le nouveau format
    const newWidthPercent = (newCropWidth / containerRect.offsetWidth) * 100;
    const newHeightPercent = (newCropHeight / containerRect.offsetHeight) * 100;
    
    // Centrer le nouveau cadre
    const newX = Math.max(0, Math.min(50 - newWidthPercent / 2, 100 - newWidthPercent));
    const newY = Math.max(0, Math.min(50 - newHeightPercent / 2, 100 - newHeightPercent));
    
    const newCrop = {
      x: newX,
      y: newY,
      width: newWidthPercent,
      height: newHeightPercent
    };
    
    setCropArea(newCrop);
    onCropChange(newCrop);
  }, [dimension]); // Se déclenche quand dimension change

  const { width: cropWidth, height: cropHeight } = getCropDimensions();

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

  return (
    <div className="space-y-4">
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
            width: `${cropArea.width}%`,
            height: `${cropArea.height}%`,
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
              backgroundSize: `${100 / (cropArea.width / 100)}% ${100 / (cropArea.height / 100)}%`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
