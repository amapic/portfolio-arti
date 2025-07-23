import React, { useState } from 'react';
import Link from 'next/link';
import { DarkModeToggle } from './DarkModeToggle';
import { CategoryNavigation } from './CategoryNavigation';
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';

export const Header = () => {
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Portfolio Artistique
          </Link>
          
          {/* Menu Admin */}
          <div className="relative">
            <button
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 
                hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 
                rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Admin Images
              {showCategoryMenu ? <HiOutlineX className="w-4 h-4" /> : <HiOutlineMenu className="w-4 h-4" />}
            </button>
            
            {/* Dropdown menu avec catégories */}
            {showCategoryMenu && (
              <div className="absolute top-full left-0 mt-2 p-4 bg-white dark:bg-gray-800 border border-gray-200 
                dark:border-gray-700 rounded-lg shadow-lg min-w-[300px] z-50">
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Filtrer par catégorie :
                </div>
                <CategoryNavigation 
                  variant="vertical"
                  className="w-full"
                  showAllOption={true}
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <DarkModeToggle />
        </div>
      </div>
      
      {/* Overlay pour fermer le menu en cliquant à l'extérieur */}
      {showCategoryMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowCategoryMenu(false)}
        />
      )}
    </header>
  );
}; 