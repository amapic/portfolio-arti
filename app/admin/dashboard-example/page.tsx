"use client";

import React, { useEffect } from 'react';
import { BarbaPage, useBarbaInit, barbaStyles } from '../../components/BarbaTransition';
import { BarbaLink, AdminNavLink } from '../../components/BarbaLinks';

// Exemple de dashboard admin avec transitions Barba.js
const AdminDashboardExample: React.FC = () => {
  // Initialiser Barba.js
  useBarbaInit();

  // Injecter les styles CSS
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const styleElement = document.createElement('style');
      styleElement.textContent = barbaStyles;
      document.head.appendChild(styleElement);
      
      return () => {
        document.head.removeChild(styleElement);
      };
    }
  }, []);

  return (
    <BarbaPage namespace="admin-dashboard">
      <div className="min-h-screen bg-gray-50">
        {/* Header avec navigation */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-gray-900">
                🎨 Admin Dashboard
              </h1>
              <nav className="flex space-x-4">
                <BarbaLink href="/admin/dashboard-example" className="text-blue-600 hover:text-blue-800">
                  Dashboard
                </BarbaLink>
                <BarbaLink href="/admin/images-example" className="text-gray-600 hover:text-gray-800">
                  Images
                </BarbaLink>
                <BarbaLink href="/admin/categories-example" className="text-gray-600 hover:text-gray-800">
                  Catégories
                </BarbaLink>
                <BarbaLink href="/admin/texts-example" className="text-gray-600 hover:text-gray-800">
                  Textes
                </BarbaLink>
              </nav>
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card Images */}
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-3xl">🖼️</span>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">Gestion des Images</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Gérer les images de votre portfolio
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <BarbaLink 
                    href="/admin/images-example"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                  >
                    Accéder aux images
                    <span className="ml-2">→</span>
                  </BarbaLink>
                </div>
              </div>
            </div>

            {/* Card Catégories */}
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-3xl">📂</span>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">Catégories</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Organiser vos catégories
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <BarbaLink 
                    href="/admin/categories-example"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
                  >
                    Gérer les catégories
                    <span className="ml-2">→</span>
                  </BarbaLink>
                </div>
              </div>
            </div>

            {/* Card Textes */}
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-3xl">📝</span>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">Textes</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Modifier le contenu textuel
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <BarbaLink 
                    href="/admin/texts-example"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
                  >
                    Éditer les textes
                    <span className="ml-2">→</span>
                  </BarbaLink>
                </div>
              </div>
            </div>
          </div>

          {/* Section statistiques */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Statistiques rapides</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow text-center">
                <div className="text-2xl font-bold text-blue-600">42</div>
                <div className="text-sm text-gray-500">Images</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow text-center">
                <div className="text-2xl font-bold text-green-600">8</div>
                <div className="text-sm text-gray-500">Catégories</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow text-center">
                <div className="text-2xl font-bold text-purple-600">15</div>
                <div className="text-sm text-gray-500">Textes</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow text-center">
                <div className="text-2xl font-bold text-orange-600">1.2k</div>
                <div className="text-sm text-gray-500">Vues</div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Loading overlay pour les transitions */}
      <div className="barba-loading">
        <div className="barba-loading-spinner"></div>
      </div>
    </BarbaPage>
  );
};

export default AdminDashboardExample;
