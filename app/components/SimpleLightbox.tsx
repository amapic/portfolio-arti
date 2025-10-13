"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { GalleryItem } from '../types/GalleryItem';

interface SimpleLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: GalleryItem[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

const SimpleLightbox: React.FC<SimpleLightboxProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onIndexChange
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Navigation avec les touches du clavier
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        goToPrevious();
        break;
      case 'ArrowRight':
        goToNext();
        break;
    }
  }, [isOpen, currentIndex]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Empêcher le scroll du body quand le lightbox est ouvert
  useEffect(() => {
    if (isOpen) {
      // Sauvegarder les styles originaux
      const originalStyle = window.getComputedStyle(document.body);
      const originalOverflow = originalStyle.overflow;
      const originalPaddingRight = originalStyle.paddingRight;
      const originalPosition = originalStyle.position;
      const originalTop = originalStyle.top;
      const originalLeft = originalStyle.left;
      const originalWidth = originalStyle.width;
      
      // Calculer la largeur de la scrollbar pour éviter le décalage
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Appliquer les styles pour masquer la scrollbar et bloquer le scroll
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.fontFamily = "ExposureTrial, serif";
      
      // Bloquer le scroll tactile sur mobile
      document.body.style.position = 'fixed';
      document.body.style.top = `-${window.scrollY}px`;
      document.body.style.left = '0';
      document.body.style.width = '100%';
      
      // Prévenir les gestes tactiles (pinch-to-zoom, swipe, etc.)
      document.body.style.touchAction = 'none';
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      
      // Fonction pour bloquer les événements tactiles
      const preventTouchMove = (e: TouchEvent) => {
        e.preventDefault();
      };
      
      const preventWheel = (e: WheelEvent) => {
        e.preventDefault();
      };
      
      // Ajouter les écouteurs d'événements
      document.addEventListener('touchmove', preventTouchMove, { passive: false });
      document.addEventListener('wheel', preventWheel, { passive: false });
      
      // Fonction de nettoyage
      return () => {
        // Restaurer les styles originaux
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.left = originalLeft;
        document.body.style.width = originalWidth;
        document.body.style.touchAction = '';
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';
        
        // Restaurer la position de scroll
        const scrollY = parseInt(document.body.style.top || '0') * -1;
        window.scrollTo(0, scrollY);
        
        // Supprimer les écouteurs d'événements
        document.removeEventListener('touchmove', preventTouchMove);
        document.removeEventListener('wheel', preventWheel);
      };
    }
  }, [isOpen]);

  const goToNext = () => {
    const nextIndex = (currentIndex + 1) % images.length;
    onIndexChange(nextIndex);
    setIsLoaded(false);
  };

  const goToPrevious = () => {
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    onIndexChange(prevIndex);
    setIsLoaded(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !images.length) return null;

  const currentImage = images[currentIndex];

  return (
    <div 
      className="fixed inset-0 bg-black  z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Bouton fermer */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-3xl z-10 hover:text-gray-300 transition-colors"
        aria-label="Fermer"
      >
        ×
      </button>

      {/* Bouton précédent */}
      {images.length > 1 && (
        <button
          onClick={goToPrevious}
          className="w-[70px] h-[40px] absolute left-4 top-1/2 transform -translate-y-1/2 z-10 
                     bg-black bg-opacity-50 hover:bg-opacity-70 transition-all duration-200 
                     rounded-md flex items-center justify-center group"
          aria-label="Image précédente"
        >
          <svg 
            className="w-6 h-6 fill-white group-hover:fill-gray-200 transition-colors" 
            viewBox="0 0 12.8 9.58"
          >
            <path d="M4.8,2.08c-1.06,0.97-2.15,1.9-3.28,2.79c-0.14,0.12-0.22,0.25-0.22,0.38s0.08,0.26,0.22,0.38c1.13,0.89,2.22,1.82,3.28,2.79
              c0.4,0.37,0.79,0.05,0.47-0.37c-0.44-0.63-0.98-1.28-1.4-1.93c-0.19-0.3-0.02-0.58,0.33-0.56L9.99,5.89C10.46,5.91,10.8,5.64,10.8,5.25
              s-0.34-0.67-0.81-0.64L4.2,4.94c-0.35,0.02-0.54-0.25-0.32-0.55c0.41-0.65,0.96-1.3,1.4-1.93C5.58,2.03,5.2,1.72,4.8,2.08"/>
          </svg>
        </button>
      )}

      {/* Bouton suivant */}
      {images.length > 1 && (
        <button
          onClick={goToNext}
          className="w-[70px] h-[40px] absolute right-4 top-1/2 transform -translate-y-1/2 z-10 
                     bg-black bg-opacity-50 hover:bg-opacity-70 transition-all duration-200 
                     rounded-md flex items-center justify-center group"
          aria-label="Image suivante"
        >
          <svg 
            className="w-6 h-6 fill-white group-hover:fill-gray-200 transition-colors" 
            viewBox="0 0 12.8 9.58"
          >
            <path d="M8,8.42c1.06-0.97,2.15-1.9,3.28-2.79c0.14-0.12,0.22-0.25,0.22-0.38s-0.08-0.26-0.22-0.38C10.15,3.98,9.05,3.05,8,2.08
              C7.6,1.71,7.21,2.03,7.53,2.45c0.44,0.63,0.98,1.28,1.4,1.93c0.19,0.3,0.02,0.58-0.33,0.56L2.81,4.61C2.34,4.59,2,4.86,2,5.25
              s0.34,0.67,0.81,0.64L8.6,5.56c0.35-0.02,0.54,0.25,0.32,0.55c-0.41,0.65-0.96,1.3-1.4,1.93C7.22,8.47,7.6,8.78,8,8.42"/>
          </svg>
        </button>
      )}

      {/* Container de l'image */}
      <div className="relative max-w-[100vw] max-h-[100vh] flex flex-col items-center">
        {/* Loading indicator */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}

        {/* Image principale */}
        <img
          src={currentImage.imageUrl}
          alt={currentImage.alt}
          className={`max-w-full max-h-[80vh] object-contain transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsLoaded(true)}
        />

        {/* Informations de l'image */}
        <div className="mt-4 text-center text-white">
          {currentImage.titre && (
            <h3 className="text-xl font-semibold mb-2">{currentImage.titre}</h3>
          )}
          {currentImage.sousTitre && (
            <p className="text-white">{currentImage.sousTitre}</p>
          )}
          
          {/* Compteur d'images */}
          {/* {images.length > 1 && (
            <p className="text-sm text-gray-400 mt-2"
              style={{ fontFamily: "ExposureTrial, serif" }}
            >
              {currentIndex + 1} / {images.length}
            </p>
          )} */}
        </div>
      </div>

      {/* Thumbnails en bas (optionnel) */}
      {images.length > 1 && images.length <= 10 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => {
                onIndexChange(index);
                setIsLoaded(false);
              }}
              className={`w-16 h-16 overflow-hidden rounded border-2 transition-all ${
                index === currentIndex 
                  ? 'border-white opacity-100' 
                  : 'border-gray-500 opacity-60 hover:opacity-80'
              }`}
            >
              <img
                src={image.imageUrl}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleLightbox;