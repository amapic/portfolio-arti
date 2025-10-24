"use client";

import React, { useState, useEffect } from 'react';
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
  const [imageOverflows, setImageOverflows] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [animationDuration, setAnimationDuration] = useState(8);
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageVisible, setImageVisible] = useState(true);

  // Vitesse de défilement en pixels par seconde (vous pouvez ajuster cette valeur)
  const scrollSpeed = 20  ; // pixels par seconde



  // Ajouter l'animation CSS dans le head
  useEffect(() => {
    // Créer les keyframes CSS pour l'animation
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes panRight {
        0% { object-position: left center; }
        100% { object-position: right center; }
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

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
        
        // Nettoyer le timeout de loading
        stopLoadingIndicator();
      };
    }
  }, [isOpen]);

  // Nettoyer le timeout quand le composant se démonte
  useEffect(() => {
    return () => {
      stopLoadingIndicator();
    };
  }, []);

  // Réinitialiser les états quand l'index change
  useEffect(() => {
    setIsLoaded(false);
    setImageOverflows(false);
    setAnimationEnabled(false); // Commencer sans animation
    setAnimationDuration(8);
    // Note: ne pas réinitialiser isTransitioning et imageVisible ici car ils sont gérés par les fonctions de navigation
    if (!isTransitioning) {
      setShowLoadingIndicator(false); // Masquer l'indicateur de chargement seulement si pas en transition
    }
    if (loadingTimeout && !isTransitioning) {
      clearTimeout(loadingTimeout);
      setLoadingTimeout(null);
    }
  }, [currentIndex]);

  // Fonction pour détecter si l'image déborde en largeur
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    
    // Calculer les dimensions de l'image si elle était redimensionnée pour couvrir l'écran
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const imageAspectRatio = naturalWidth / naturalHeight;
    const screenAspectRatio = screenWidth / screenHeight;
    
    // Si l'image est plus large que l'écran une fois redimensionnée pour couvrir la hauteur
    if (imageAspectRatio > screenAspectRatio) {
      // L'image va déborder en largeur
      const scaledWidth = screenHeight * imageAspectRatio;
      const overflowDistance = scaledWidth - screenWidth;
      
      // Calculer la durée basée sur la distance et la vitesse
      const calculatedDuration = overflowDistance / scrollSpeed;
      setAnimationDuration(Math.max(calculatedDuration, 2)); // Minimum 2 secondes
      
      setImageOverflows(scaledWidth > screenWidth);
      setImageDimensions({ width: scaledWidth, height: screenHeight });
    } else {
      setImageOverflows(false);
      setImageDimensions({ width: screenWidth, height: screenHeight });
    }
    
    setIsLoaded(true);
    setAnimationEnabled(true); // Réactiver l'animation pour la nouvelle image
    setIsTransitioning(false); // Fin de la transition
    stopLoadingIndicator();
  };

  // Fonction pour gérer le délai de chargement
  const startLoadingIndicator = () => {
    // Nettoyer le timeout précédent
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }
    
    // Démarrer un nouveau timeout de 2 secondes
    const timeout = setTimeout(() => {
      setShowLoadingIndicator(true);
    }, 2000);
    
    setLoadingTimeout(timeout);
  };

  const stopLoadingIndicator = () => {
    // Nettoyer le timeout et cacher l'indicateur
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      setLoadingTimeout(null);
    }
    setShowLoadingIndicator(false);
  };

  const goToNext = () => {
    // Empêcher les clics multiples pendant la transition
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setImageVisible(false);  // Masquer immédiatement l'image
    setIsLoaded(false);
    setAnimationEnabled(false);
    setImageOverflows(false);
    
    // Changer d'image après avoir masqué la précédente
    setTimeout(() => {
      startLoadingIndicator();
      const nextIndex = (currentIndex + 1) % images.length;
      onIndexChange(nextIndex);
      setImageVisible(true);  // Réafficher pour la nouvelle image
    }, 200); // Délai plus long pour éviter le scintillement
  };

  const goToPrevious = () => {
    // Empêcher les clics multiples pendant la transition
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setImageVisible(false);  // Masquer immédiatement l'image
    setIsLoaded(false);
    setAnimationEnabled(false);
    setImageOverflows(false);
    
    // Changer d'image après avoir masqué la précédente
    setTimeout(() => {
      startLoadingIndicator();
      const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
      onIndexChange(prevIndex);
      setImageVisible(true);  // Réafficher pour la nouvelle image
    }, 200); // Délai plus long pour éviter le scintillement
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
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
      style={{
        '--pan-animation': imageOverflows ? 'pan-right 8s linear infinite alternate' : 'none'
      } as React.CSSProperties}
    >

      <div className="fixed left-0 bottom-0 mb-4 w-full text-center text-white z-40">
        {currentImage.titre && (
          <h3 className="text-2xl font-semibold mb-2">{currentImage.titre}</h3>
        )}
      </div>
      {/* Bouton fermer */}
      <button
        onClick={onClose}
        className="absolute top-4 right-8 text-white text-3xl z-30 hover:text-gray-300 transition-colors"
        aria-label="Fermer"
        style={{
          fontFamily: "ExposureTrial, serif"
        }}
      >
        x
      </button>

      {/* Bouton précédent */}
      {images.length > 1 && (
        <button
          onClick={goToPrevious}
          className="w-[70px] h-[40px] absolute left-4 top-1/2 transform -translate-y-1/2 z-30 
                       transition-all duration-200 
                     rounded-md flex items-center justify-center group "
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
          className="w-[70px] h-[40px] absolute right-4 top-1/2 transform -translate-y-1/2 z-30 
                      transition-all duration-200 
                     rounded-md flex items-center justify-center group "
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
      <div className="absolute inset-0">
        {/* Loading indicator */}
        {!isLoaded && showLoadingIndicator && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}

        {/* Image principale - couvre tout l'écran */}
        <img
          key={`lightbox-image-${currentIndex}`}
          src={currentImage.imageUrl}
          alt={currentImage.alt}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded && !isTransitioning && imageVisible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            objectPosition: imageOverflows ? 'left center' : 'center center',
            animation: (imageOverflows && animationEnabled && !isTransitioning && imageVisible) ? `panRight ${animationDuration}s linear infinite alternate` : 'none',
            visibility: isLoaded && !isTransitioning && imageVisible ? 'visible' : 'hidden',
            display: imageVisible ? 'block' : 'none'
          }}
          onLoad={handleImageLoad}
          onError={() => {
            setIsLoaded(true);
            setIsTransitioning(false);
            setAnimationEnabled(false);
            stopLoadingIndicator();
          }}
        />

        {/* Informations de l'image */}
        {/* <div className="absolute left-0 bottom-0 mb-4 w-full text-center text-white "> */}
          {/* {currentImage.titre && (
            // <h3 className="text-2xl font-semibold mb-2">{currentImage.titre}</h3>
          )} */}
          {/* {currentImage.sousTitre && (
            <p className="text-white">{currentImage.sousTitre}</p>
          )} */}

          {/* Compteur d'images */}
          {/* {images.length > 1 && (
            <p className="text-sm text-gray-400 mt-2"
              style={{ fontFamily: "ExposureTrial, serif" }}
            >
              {currentIndex + 1} / {images.le ngth}
            </p>
          )} */}
        {/* </div> */}
      </div>

      {/* Thumbnails en bas (optionnel) */}
      {/* {images.length > 1 && images.length <= 10 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-40">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => {
                onIndexChange(index);
                setIsLoaded(false);
              }}
              className={`w-16 h-16 overflow-hidden rounded border-2 transition-all ${index === currentIndex
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
      )} */}
    </div>
  );
};

export default SimpleLightbox;