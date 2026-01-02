"use client";

import React, { useState } from 'react';
import { BsBoxArrowRight, BsPersonCircle } from "react-icons/bs";
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './SimpleAuthProvider';

export const Header = () => {
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  const { logout, user, loading } = useAuth();

  return (
    <header className="z-10 fixed top-0 left-0 right-0 z-50 bg-bgheader dark:bg-gray-900 text-white pt-[10px] lg:pt-0 h-[80px] lg:h-[60px]">
      <div className="w-[100%] mx-auto px-6 py-[10px] flex justify-around items-center ">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xl font-thin text-paleblue hover:text-white transition-colors lg:flex items-center gap-2 hidden"
          >
            <span className="text-sm mt-1">◁</span>
            Aller au site web
          </Link>

          {/* Menu Admin - Navigation entre pages admin (desktop only) */}
          {isAdminPage && (
            <nav className="lg:flex items-center gap-2 ml-6 font-admin hidden">
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

        <div className="flex items-center gap-4 h-full w-full lg:w-auto justify-around lg:justify-normal"
        
        >
          {/* Menu hamburger (mobile only) */}
          {isAdminPage && (
            // <></>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden px-2 text-white hover:text-paleblue transition-colors"
              aria-label="Menu"
            >
              {showMobileMenu ? <HiOutlineX className="w-12 h-10" /> : <HiOutlineMenu className="w-12 h-10" />}
            </button>
          )}

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

      {/* Menu mobile hamburger */}
      {isAdminPage && showMobileMenu && (
        <>
          {/* Overlay pour fermer le menu en cliquant à l'extérieur */}
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setShowMobileMenu(false)}
          />
          
          {/* Menu mobile */}
          <div className="fixed top-[60px] right-0 w-64 h-[calc(100vh-60px)] bg-bgheader dark:bg-gray-900 z-50 shadow-xl lg:hidden overflow-y-auto">
            <nav className="flex flex-col p-4 gap-2">
              <Link
                href="/"
                onClick={() => setShowMobileMenu(false)}
                className="px-4 py-3 text-sm rounded-lg transition-colors text-paleblue hover:text-white hover:bg-customblue flex items-center gap-2"
              >
                <span className="text-sm">◁</span>
                Aller au site web
              </Link>
              
              <div className="border-t border-gray-700 my-2"></div>
              
              <Link
                href="/admin/images"
                onClick={() => setShowMobileMenu(false)}
                className={`px-4 py-3 text-sm rounded-lg transition-colors ${
                  pathname === '/admin/images'
                    ? 'bg-customblue text-white font-medium'
                    : 'text-white hover:bg-customblue hover:text-white'
                }`}
              >
                Images
              </Link>
              
              <Link
                href="/admin/about"
                onClick={() => setShowMobileMenu(false)}
                className={`px-4 py-3 text-sm rounded-lg transition-colors ${
                  pathname === '/admin/about'
                    ? 'bg-customblue text-white font-medium'
                    : 'text-white hover:bg-customblue hover:text-white'
                }`}
              >
                À propos
              </Link>
              
              <Link
                href="/admin/contact"
                onClick={() => setShowMobileMenu(false)}
                className={`px-4 py-3 text-sm rounded-lg transition-colors ${
                  pathname === '/admin/contact'
                    ? 'bg-customblue text-white font-medium'
                    : 'text-white hover:bg-customblue hover:text-white'
                }`}
              >
                Contact
              </Link>
              
              <Link
                href="/admin/categories"
                onClick={() => setShowMobileMenu(false)}
                className={`px-4 py-3 text-sm rounded-lg transition-colors ${
                  pathname === '/admin/categories'
                    ? 'bg-customblue text-white font-medium'
                    : 'text-white hover:bg-customblue hover:text-white'
                }`}
              >
                Categories
              </Link>
            </nav>
          </div>
        </>
      )}

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