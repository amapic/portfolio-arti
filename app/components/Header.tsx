"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// import { CategoryNavigation } from './CategoryNavigation';
// import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import { useAuth } from './SimpleAuthProvider';

export const Header = () => {
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  const { logout, user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bgheader dark:bg-gray-900 text-white min-h-[60px]">
      <div className="w-[100%] mx-auto px-6 py-[10px] flex justify-around items-center ">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xl font-thin text-paleblue hover:text-white   transition-colors flex items-center gap-2"
          >
            <span className="text-sm mt-1">◁</span>
            Aller au site web
          </Link>

          {/* Menu Admin - Navigation entre pages admin */}
          {isAdminPage && (
            <nav className="flex items-center gap-2 ml-6 font-admin">
              <Link
                href="/admin/images"
                className={`px-3 py-2 text-sm rounded-lg transition-colors text-center border border-customblue  ${pathname === '/admin/images'
                    ? 'bg-customblue dark:bg-customblue text-white dark:text-white font-medium'
                    : ' text-white  hover:text-gray-900 dark:hover:text-white hover:bg-blue-50 '
                  }`}
              >
                Images
              </Link>
              <Link
                href="/admin/about"
                className={`px-3 py-2 text-sm rounded-lg transition-colors border border-customblue ${pathname === '/admin/about'
                    ? 'bg-customblue dark:bg-customblue text-white dark:text-white font-medium'
                    : ' text-white  hover:text-gray-900 dark:hover:text-white hover:bg-blue-50'
                  }`}
              >
                À propos
              </Link>
              <Link
                href="/admin/contact"
                className={`px-3 py-2 text-sm rounded-lg transition-colors text-center border border-customblue ${pathname === '/admin/contact'
                    ? 'bg-customblue  text-white dark:text-white font-medium'
                    : 'text-white  hover:text-customblue  hover:bg-blue-50'
                  }`}
              >
                Contact
              </Link>
              <Link
                href="/admin/categories"
                className={`px-3 py-2 text-sm rounded-lg transition-colors  border border-customblue text-center ${pathname === '/admin/categories'
                    ? 'bg-customblue dark:bg-customblue text-white dark:text-white font-medium'
                    : 'text-white dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
              >
                Categories
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4 h-full">
          {/* Informations utilisateur et déconnexion pour les pages admin */}
          {isAdminPage && user && (
            <>
              <span className={`px-4 py-2 text-center rounded-md text-sm font-medium ${user.role === 'admin'
                  ? 'bg-customgreen text-green-800'
                  : 'bg-customyellow text-white'
                }`}>
                {user.role === 'admin' ? 'Mon statut : Administrateur' : 'Mon statut : Viewer (Lecture seule)'}
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-customred text-white rounded-sm hover:bg-custom-red transition-colors"
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