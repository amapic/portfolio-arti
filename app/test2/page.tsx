
"use client";

import React, { useState, useEffect } from 'react';

function App() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculer la rotation basée sur le scroll (0 à 360 degrés)
  const rotationX = (scrollY * 0.3) % 360;
  const rotationY = (scrollY * 0.2) % 360;

  return (
    <div className="bg-[url('/rives-tradition.jpg')] bg-cover font-exposure">
      {/* Section pour permettre le scroll */}
      <div className="h-[300vh]">
        {/* Container fixe pour les chiffres */}
        <div className="fixed inset-0 flex items-center justify-center">
          <div 
            className="text-[20rem] font-bold text-white select-none"
            style={{
              transform: `perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
              transformStyle: 'preserve-3d',
              textShadow: `
                0 0 20px rgba(0,0,0,0.8),
                0 0 40px rgba(0,0,0,0.6),
                0 0 60px rgba(0,0,0,0.4),
                ${Math.sin(rotationY * Math.PI / 180) * 20}px ${Math.cos(rotationX * Math.PI / 180) * 20}px 0 rgba(0,0,0,0.9)
              `,
              filter: `drop-shadow(${Math.sin(rotationY * Math.PI / 180) * 10}px ${Math.cos(rotationX * Math.PI / 180) * 10}px 20px rgba(0,0,0,0.5))`,
              transition: 'all 0.1s ease-out'
            }}
          >
            80
          </div>
        </div>

        {/* Indicateur de scroll */}
        <div className="fixed top-4 left-4 bg-black bg-opacity-50 text-white p-4 rounded">
          <p className="text-sm">Scroll: {Math.round(scrollY)}px</p>
          <p className="text-sm">Rotation X: {Math.round(rotationX)}°</p>
          <p className="text-sm">Rotation Y: {Math.round(rotationY)}°</p>
        </div>

        {/* Content sections pour créer du scroll */}
        <div className="h-screen flex items-center justify-end pr-20">
          <div className="text-white text-right text-2xl max-w-md">
            <h2 className="text-4xl mb-4">Scroll vers le bas</h2>
            <p>Les chiffres changent d'angle de vue en fonction de votre position de scroll.</p>
          </div>
        </div>

        <div className="h-screen flex items-center justify-start pl-20">
          <div className="text-white text-left text-2xl max-w-md">
            <h2 className="text-4xl mb-4">Effet 3D</h2>
            <p>L'effet utilise les transformations CSS 3D avec perspective pour créer une rotation fluide.</p>
          </div>
        </div>

        <div className="h-screen flex items-center justify-center">
          <div className="text-white text-center text-2xl max-w-md">
            <h2 className="text-4xl mb-4">Fin de l'effet</h2>
            <p>Continuez à scroller pour voir les chiffres continuer leur rotation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
