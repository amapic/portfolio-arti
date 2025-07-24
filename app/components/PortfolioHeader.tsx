"use client";

import React from 'react';

interface PortfolioHeaderProps {
  title?: string;
  showNavigation?: boolean;
}

const PortfolioHeader: React.FC<PortfolioHeaderProps> = ({ 
  title = "Romain de Lagarde",
  showNavigation = true 
}) => {
  return (
    <header className="flex flex-col items-center justify-center px-16 py-8 bg-white/95 backdrop-blur-md text-center gap-4 h-[160px] pt-[60px]">
      <h1 className="text-6xl font-normal tracking-wide text-black m-0 font-serif">
        {title}
      </h1>
      {showNavigation && (
        <nav className="flex items-center justify-center gap-4">
          <a 
            href="/romain" 
            className="w-[100px] text-black no-underline text-lg font-semibold opacity-70 tracking-wide hover:opacity-100 transition-opacity duration-200"
          >
            portfolio
          </a>
          <span className="text-gray-400 font-light">|</span>
          <a 
            href="/romain/a-propos" 
            className="w-[100px] text-black no-underline text-lg font-semibold opacity-70 tracking-wide hover:opacity-100 transition-opacity duration-200"
          >
            à propos
          </a>
          <span className="text-gray-400 font-light">|</span>
          <a 
            href="/romain/contact" 
            className="w-[100px] text-black no-underline text-lg font-semibold opacity-70 tracking-wide hover:opacity-100 transition-opacity duration-200"
          >
            contact
          </a>
        </nav>
      )}
    </header>
  );
};

export default PortfolioHeader;
