"use client";

import React, { useEffect, useState } from 'react';
// @ts-ignore - Barba types are not perfect
import barba from '@barba/core';

const BarbaLoadingIndicator: React.FC = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeLeave = () => {
      setIsTransitioning(true);
      // Ajouter la classe de chargement au body
      document.body.classList.add('barba-transitioning');
      
      // Créer l'indicateur de progression
      const loadingBar = document.createElement('div');
      loadingBar.className = 'barba-loading';
      loadingBar.id = 'barba-loading-bar';
      document.body.appendChild(loadingBar);
    };

    const handleAfterEnter = () => {
      setIsTransitioning(false);
      // Retirer la classe de chargement du body
      document.body.classList.remove('barba-transitioning');
      
      // Supprimer l'indicateur de progression après un délai
      setTimeout(() => {
        const loadingBar = document.getElementById('barba-loading-bar');
        if (loadingBar) {
          loadingBar.remove();
        }
      }, 100);
    };

    // Écouter les événements Barba si il est initialisé
    const checkBarba = () => {
      if (barba && barba.hooks) {
        barba.hooks.beforeLeave(handleBeforeLeave);
        barba.hooks.afterEnter(handleAfterEnter);
      } else {
        // Réessayer après un court délai
        setTimeout(checkBarba, 100);
      }
    };

    checkBarba();

    return () => {
      // Nettoyer les événements lors du démontage
      if (barba && barba.hooks) {
        try {
          barba.hooks.beforeLeave.clear?.();
          barba.hooks.afterEnter.clear?.();
        } catch (error) {
          console.log('Barba hooks cleanup failed:', error);
        }
      }
    };
  }, []);

  return null; // Ce composant n'affiche rien, il gère juste les événements
};

export default BarbaLoadingIndicator;
