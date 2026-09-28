"use client";

import React from "react";

interface PortfolioHeaderProps {
  title?: string;
  showNavigation?: boolean;
  currentPage?: string;
}

const PortfolioHeader: React.FC<PortfolioHeaderProps> = ({
  title = "Pierre Bazin",
  showNavigation = true,
}) => {


  return (
    <header className="flex flex-col items-center justify-center px-16 pb-8 bg-white/95 backdrop-blur-md text-center gap-4 h-[160px] pt-[60px]">
      <h1
        className="text-5xl font-[10] tracking-wide text-black m-0 sm:ml-4 md:ml-0 font-exposure requires-exposure"
      >
        {title}
      </h1>
      {showNavigation && (
        <nav className="flex items-center justify-center sm:gap-3 md:gap-4 requires-exposure">
           <a 
            href="/" 
            className="w-[100px] text-md lg:text-lg text-black no-underline font-[400]  tracking-wide hover:font-[600] transition-all duration-200 hover:text-shadow font-exposure"
          >
            home
          </a> 
           <span className="text-black font-light">|</span> 
          <a
            href="/a-propos"
            className="w-[100px] text-md lg:text-lg text-black no-underline font-[400]  tracking-wide hover:font-[600] transition-all duration-200 hover:text-shadow font-exposure"
          >
            about
          </a>
          <span className="text-black font-light">|</span>
          <a
            href="/contact"
            className="w-[100px] text-md lg:text-lg  text-black no-underline font-[50] tracking-wide hover:font-[600] transition-all duration-200 hover:text-shadow font-exposure"
          >
            contact
          </a>
        </nav>
      )}
    </header>
  );
};

export default PortfolioHeader;
