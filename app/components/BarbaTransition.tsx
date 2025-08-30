"use client";

import React, { useEffect, useRef } from 'react';
import barba from '@barba/core';
import { gsap } from 'gsap';

// Interface pour les props du wrapper
interface BarbaPageProps {
  children: React.ReactNode;
  namespace: string;
  className?: string;
}

// Composant wrapper pour les pages avec transitions Barba.js
export const BarbaPage: React.FC<BarbaPageProps> = ({ 
  children, 
  namespace,
  className = ''
}) => {
  return (
    <div 
      data-barba="container" 
      data-barba-namespace={namespace}
      className={`barba-container ${className}`}
    >
      {children}
    </div>
  );
};

// Hook pour initialiser Barba.js
export const useBarbaInit = () => {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || typeof window === 'undefined') return;
    
    // Initialisation de Barba.js
    barba.init({
      debug: true,
      
      // Transitions globales
      transitions: [
        {
          name: 'fade-transition',
          leave(data) {
            console.log('🚪 Leaving:', data.current.namespace);
            return new Promise((resolve) => {
              gsap.to(data.current.container, {
                opacity: 0,
                y: -30,
                duration: 0.4,
                ease: 'power2.inOut',
                onComplete: resolve
              });
            });
          },
          enter(data) {
            console.log('🎯 Entering:', data.next.namespace);
            
            // Position initiale
            gsap.set(data.next.container, { 
              opacity: 0,
              y: 30 
            });
            
            // Animation d'entrée
            return new Promise((resolve) => {
              gsap.to(data.next.container, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: 'power2.out',
                delay: 0.1,
                onComplete: resolve
              });
            });
          }
        },
        
        // Transition spécifique pour les pages admin
        {
          name: 'admin-slide',
          from: { namespace: ['admin-dashboard'] },
          to: { namespace: ['admin-images', 'admin-categories', 'admin-texts'] },
          leave(data) {
            return new Promise((resolve) => {
              gsap.to(data.current.container, {
                x: -100,
                opacity: 0,
                duration: 0.4,
                ease: 'power2.inOut',
                onComplete: resolve
              });
            });
          },
          enter(data) {
            gsap.set(data.next.container, { 
              x: 100,
              opacity: 0 
            });
            
            return new Promise((resolve) => {
              gsap.to(data.next.container, {
                x: 0,
                opacity: 1,
                duration: 0.5,
                ease: 'power2.out',
                onComplete: resolve
              });
            });
          }
        },

        // Transition de retour vers le dashboard
        {
          name: 'admin-return',
          from: { namespace: ['admin-images', 'admin-categories', 'admin-texts'] },
          to: { namespace: ['admin-dashboard'] },
          leave(data) {
            return new Promise((resolve) => {
              gsap.to(data.current.container, {
                scale: 0.9,
                opacity: 0,
                duration: 0.3,
                ease: 'power2.inOut',
                onComplete: resolve
              });
            });
          },
          enter(data) {
            gsap.set(data.next.container, { 
              scale: 1.1,
              opacity: 0 
            });
            
            return new Promise((resolve) => {
              gsap.to(data.next.container, {
                scale: 1,
                opacity: 1,
                duration: 0.4,
                ease: 'back.out(1.7)',
                onComplete: resolve
              });
            });
          }
        }
      ],

      // Configuration des vues
      views: [
        {
          namespace: 'admin-dashboard',
          beforeEnter() {
            console.log('🏠 Préparation du dashboard admin');
          },
          afterEnter() {
            console.log('✅ Dashboard admin chargé');
          }
        },
        {
          namespace: 'admin-images',
          beforeEnter() {
            console.log('🖼️ Préparation de la page images');
          },
          afterEnter() {
            console.log('✅ Page images chargée');
          }
        },
        {
          namespace: 'admin-categories',
          beforeEnter() {
            console.log('📂 Préparation de la page catégories');
          },
          afterEnter() {
            console.log('✅ Page catégories chargée');
          }
        },
        {
          namespace: 'admin-texts',
          beforeEnter() {
            console.log('📝 Préparation de la page textes');
          },
          afterEnter() {
            console.log('✅ Page textes chargée');
          }
        }
      ]
    });

    initialized.current = true;

    // Cleanup
    return () => {
      if (barba.isRunning) {
        barba.destroy();
        initialized.current = false;
      }
    };
  }, []);
};

// Styles CSS pour les transitions
export const barbaStyles = `
  .barba-container {
    min-height: 100vh;
    position: relative;
  }

  /* Loading overlay */
  .barba-loading {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  .barba-loading.is-loading {
    opacity: 1;
    pointer-events: auto;
  }

  .barba-loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Smooth transition styles */
  .barba-container {
    will-change: transform, opacity;
  }
`;
