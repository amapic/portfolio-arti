"use client";

import React, { useState } from 'react';
import { BsBoxArrowRight, BsPersonCircle } from "react-icons/bs";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// import { CategoryNavigation } from './CategoryNavigation';
// import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import { useAuth } from './SimpleAuthProvider';

export const Header = () => {
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  const { logout, user, loading } = useAuth();

  return (
    <header className="z-10 fixed top-0 left-0 right-0 z-50 bg-bgheader dark:bg-gray-900 text-white min-h-[60px]">
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
          {isAdminPage && (
            <>
              {loading ? (
                // Affichage pendant le chargement (zones grisées)
                <>
                  <span className="px-4 py-2 text-center rounded-md text-sm font-medium flex items-center gap-2 bg-gray-300 text-gray-500 animate-pulse">
                    <BsPersonCircle className="w-5 h-5 mr-2" />
                    Vérification du statut...
                  </span>
                  <button
                    disabled
                    className="px-4 py-2 rounded-sm flex items-center gap-2 bg-gray-300 text-gray-500 cursor-not-allowed"
                  >
                    <BsBoxArrowRight className="w-4 h-4" />
                    ...
                  </button>
                </>
              ) : user ? (
                // Affichage une fois le statut vérifié
                <>
                  <span className={`px-4 py-2 text-center rounded-md text-sm font-medium flex items-center gap-2 ${user.role === 'admin'
                      ? 'bg-customgreen text-white'
                      : 'bg-customyellow text-white'
                    }`}>
                    <BsPersonCircle className="w-5 h-5 mr-2" />
                    {user.role === 'admin' ? 'Mon statut : Administrateur' : 'Mon statut : Viewer (Lecture seule)'}
                  </span>
                  <button
                    onClick={logout}
                    className={`px-4 py-2 rounded-sm transition-colors flex items-center gap-2
                      ${user.role === 'admin' ? 'bg-customred text-white hover:bg-custom-red' : 'bg-customgreen text-white hover:bg-customgreendark'}`}
                  >
                    <BsBoxArrowRight className="w-4 h-4" />
                    {user.role === 'admin' ? 'Déconnexion' : 'Se connecter'}
                  </button>
                </>
              ) : null}
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