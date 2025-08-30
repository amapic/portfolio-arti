"use client";

import React, { useEffect, useRef } from 'react';
// @ts-ignore - Barba types are not perfect
import barba from '@barba/core';
import { gsap } from 'gsap';

interface BarbaWrapperProps {
  children: React.ReactNode;
  namespace?: string;
  className?: string;
}

const BarbaWrapper: React.FC<BarbaWrapperProps> = ({ 
  children, 
  namespace = 'admin-page',
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialiser Barba.js seulement une fois
    if (!barba.isRunning) {
      barba.init({
        transitions: [
          {
            name: 'admin-fade',
            leave(data: any) {
              return gsap.to(data.current.container, {
                opacity: 0,
                y: -50,
                duration: 0.3,
                ease: 'power2.inOut'
              });
            },
            enter(data: any) {
              gsap.set(data.next.container, { 
                opacity: 0,
                y: 50 
              });
              
              return gsap.to(data.next.container, {
                opacity: 1,
                y: 0,
                duration: 0.4,
                ease: 'power2.out',
                delay: 0.1
              });
            }
          },
          // Transition spécifique pour les pages d'images
          {
            name: 'admin-slide',
            from: { namespace: ['admin-images'] },
            to: { namespace: ['admin-categories', 'admin-texts'] },
            leave(data: any) {
              return gsap.to(data.current.container, {
                x: -100,
                opacity: 0,
                duration: 0.4,
                ease: 'power2.inOut'
              });
            },
            enter(data: any) {
              gsap.set(data.next.container, { 
                x: 100,
                opacity: 0 
              });
              
              return gsap.to(data.next.container, {
                x: 0,
                opacity: 1,
                duration: 0.4,
                ease: 'power2.out'
              });
            }
          },
          // Transition retour vers dashboard
          {
            name: 'admin-return',
            to: { namespace: ['admin-dashboard'] },
            leave(data: any) {
              return gsap.to(data.current.container, {
                scale: 0.95,
                opacity: 0,
                duration: 0.3,
                ease: 'power2.inOut'
              });
            },
            enter(data: any) {
              gsap.set(data.next.container, { 
                scale: 1.05,
                opacity: 0 
              });
              
              return gsap.to(data.next.container, {
                scale: 1,
                opacity: 1,
                duration: 0.4,
                ease: 'power2.out'
              });
            }
          }
        ],
        views: [
          {
            namespace: 'admin-dashboard',
            beforeEnter() {
              console.log('🏠 Entering admin dashboard');
            }
          },
          {
            namespace: 'admin-images',
            beforeEnter() {
              console.log('🖼️ Entering admin images');
            }
          },
          {
            namespace: 'admin-categories',
            beforeEnter() {
              console.log('📂 Entering admin categories');
            }
          }
        ]
      });
    }

    return () => {
      // Cleanup si nécessaire
      if (barba.isRunning) {
        barba.destroy();
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      data-barba="container" 
      data-barba-namespace={namespace}
      className={className}
    >
      {children}
    </div>
  );
};

export default BarbaWrapper;
