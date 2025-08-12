"use client";

import React from "react";

interface PortfolioHeaderProps {
  title?: string;
  showNavigation?: boolean;
  currentPage?: string;
}

const PortfolioHeader: React.FC<PortfolioHeaderProps> = ({
  title = "Romain de Lagarde",
  showNavigation = true,
}) => {
  return (
    <header className="flex flex-col items-center justify-center px-16 pb-8 bg-white/95 backdrop-blur-md text-center gap-4 h-[160px] pt-[60px]">
      <style jsx global>{`
        .hover\\:text-shadow:hover {
          text-shadow: 0 2px 8px rgba(0,0,0,0.25), 0 1px 0 #fff;
        }
        @font-face {
          font-family: "ExposureTrial";
          src: url("/ExposureTrial-0.woff2") format("woff2");
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
      `}</style>
      <h1
        className="text-5xl font-[10] tracking-wide text-black m-0"
        style={{ fontFamily: "ExposureTrial, serif" }}
      >
        {title}
      </h1>
      {showNavigation && (
        <nav className="flex items-center justify-center gap-4">
           <a 
            href="/romain" 
            className="w-[100px] text-lg text-black no-underline font-[400]  tracking-wide hover:font-[600] transition-all duration-200 hover:text-shadow"
            style={{ fontFamily: "ExposureTrial, serif" }}
          >
            home
          </a> 
           <span className="text-gray-400 font-light">|</span> 
          <a
            href="/romain/a-propos"
            className="w-[100px] text-lg text-black no-underline font-[400]  tracking-wide hover:font-[600] transition-all duration-200 hover:text-shadow"
            style={{ fontFamily: "ExposureTrial, serif" }}
          >
            about
          </a>
          <span className="text-black font-light">|</span>
          <a
            href="/romain/contact"
            className="w-[100px] text-lg  text-black no-underline font-[50] tracking-wide hover:font-[600] transition-all duration-200 hover:text-shadow"
            style={{ fontFamily: "ExposureTrial, serif" }}
          >
            contact
          </a>
        </nav>
      )}
    </header>
  );
};

export default PortfolioHeader;
