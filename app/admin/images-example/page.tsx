"use client";

import React from 'react';
import { BarbaPage } from '../../components/BarbaTransition';
import { BarbaLink } from '../../components/BarbaLinks';

const AdminImagesExample: React.FC = () => {
  return (
    <BarbaPage namespace="admin-images">
      <div className="min-h-screen bg-gray-50">
        {/* Header avec breadcrumb */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <BarbaLink href="/admin/dashboard-example" className="text-blue-600 hover:text-blue-800">
                  ← Dashboard
                </BarbaLink>
                <span className="text-gray-300">/</span>
                <h1 className="text-2xl font-bold text-gray-900">🖼️ Gestion des Images</h1>
              </div>
              <nav className="flex space-x-4">
                <BarbaLink href="/admin/dashboard-example" className="text-gray-600 hover:text-gray-800">
                  Dashboard
                </BarbaLink>
                <BarbaLink href="/admin/images-example" className="text-blue-600 hover:text-blue-800">
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
          {/* Actions bar */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900">Mes Images</h2>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">42 images</span>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
              + Ajouter une image
            </button>
          </div>

          {/* Grid des images */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }, (_, i) => (
              <div 
                key={i} 
                className="aspect-square bg-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span className="text-2xl">🖼️</span>
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                  <button className="bg-white text-gray-800 px-3 py-1 rounded-md text-sm font-medium">
                    Éditer
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation vers autres pages */}
          <div className="mt-12 flex justify-center space-x-4">
            <BarbaLink 
              href="/admin/categories-example"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md transition-colors duration-200"
            >
              Aller aux Catégories →
            </BarbaLink>
            <BarbaLink 
              href="/admin/dashboard-example"
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md transition-colors duration-200"
            >
              Retour au Dashboard
            </BarbaLink>
          </div>
        </main>
      </div>
    </BarbaPage>
  );
};

export default AdminImagesExample;
