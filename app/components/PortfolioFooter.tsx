"use client";

import React from 'react';
import { AboutData } from '../types/about';

interface PortfolioFooterProps {
  aboutData?: AboutData;
}

const PortfolioFooter: React.FC<PortfolioFooterProps> = ({ aboutData }) => {
  const footerData = aboutData?.footer;

  // Données par défaut si aucune donnée n'est fournie
  const defaultFooterData = {
    copyrightText: "© 2025 - Pierre Besson - Photographe - Tous droits réservés",
    designBy: "Renom",
    designUrl: "https://renom.design",
    realisationBy: "dev2site",
    realisationUrl: "https://dev2site.net",
    mentionsLegalesUrl: "/mentions-legales"
  };

  const currentFooterData = footerData || defaultFooterData;

  return (
    <footer className="w-full h-full py-6 px-8  flex flex-col items-end">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright à gauche */}
          <div className="text-sm text-gray-600 font-light">
            {currentFooterData.copyrightText}
          </div>
          
          {/* Liens à droite */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {/* <span>Design :</span>
            <a 
              href={currentFooterData.designUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-800 hover:text-black transition-colors underline decoration-1 underline-offset-2"
            >
              {currentFooterData.designBy}
            </a> */}
            
            <span className="mx-2 text-gray-400">|</span>
            
            <span>Réalisation :</span>
            <a 
              href={currentFooterData.realisationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-800 hover:text-black transition-colors underline decoration-1 underline-offset-2"
            >
              {currentFooterData.realisationBy}
            </a>
            
            <span className="mx-2 text-gray-400">|</span>
            
            <a 
              href={currentFooterData.mentionsLegalesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-800 hover:text-black transition-colors underline decoration-1 underline-offset-2"
            >
              Mentions légales
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PortfolioFooter;
