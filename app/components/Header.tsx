import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CategoryNavigation } from './CategoryNavigation';
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import { useAuth } from './SimpleAuthProvider';

export const Header = () => {
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  const { logout, user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Site web
          </Link>
          
          {/* Menu Admin - Navigation entre pages admin */}
          {isAdminPage && (
            <nav className="flex items-center gap-2 ml-6">
              <Link
                href="/admin/images"
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  pathname === '/admin/images' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-medium'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                Images
              </Link>
              <Link
                href="/admin/about"
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  pathname === '/admin/about' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-medium'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                À propos
              </Link>
              <Link
                href="/admin/contact"
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  pathname === '/admin/contact' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-medium'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                Contact
              </Link>
              <Link
                href="/admin/categories"
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  pathname === '/admin/categories' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-medium'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                Categories
              </Link>
            </nav>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {/* Informations utilisateur et déconnexion pour les pages admin */}
          {isAdminPage && user && (
            <>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                user.role === 'admin' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-orange-100 text-orange-800'
              }`}>
                {user.role === 'admin' ? 'Administrateur' : 'Viewer (Lecture seule)'}
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Déconnexion
              </button>
            </>
          )}
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