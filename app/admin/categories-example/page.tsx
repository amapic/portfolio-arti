"use client";

import React from 'react';
import { BarbaPage } from '../../components/BarbaTransition';
import { BarbaLink } from '../../components/BarbaLinks';

const AdminCategoriesExample: React.FC = () => {
  const categories = [
    { id: 1, name: 'Photographie', count: 15, color: 'bg-blue-500' },
    { id: 2, name: 'Design', count: 12, color: 'bg-purple-500' },
    { id: 3, name: 'Web', count: 8, color: 'bg-green-500' },
    { id: 4, name: 'Art', count: 7, color: 'bg-red-500' },
  ];

  return (
    <BarbaPage namespace="admin-categories">
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
                <h1 className="text-2xl font-bold text-gray-900">📂 Gestion des Catégories</h1>
              </div>
              <nav className="flex space-x-4">
                <BarbaLink href="/admin/dashboard-example" className="text-gray-600 hover:text-gray-800">
                  Dashboard
                </BarbaLink>
                <BarbaLink href="/admin/images-example" className="text-gray-600 hover:text-gray-800">
                  Images
                </BarbaLink>
                <BarbaLink href="/admin/categories-example" className="text-blue-600 hover:text-blue-800">
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
        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Actions bar */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900">Catégories</h2>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                {categories.length} catégories
              </span>
            </div>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors">
              + Nouvelle catégorie
            </button>
          </div>

          {/* Liste des catégories */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {categories.map((category, index) => (
                <li 
                  key={category.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animation: 'fadeInUp 0.5s ease-out forwards'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full ${category.color} mr-4`}></div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-500">{category.count} images</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-600 hover:bg-blue-50 transition-colors">
                        Éditer
                      </button>
                      <button className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-600 hover:bg-red-50 transition-colors">
                        Supprimer
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Statistiques */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-green-600">
                {categories.reduce((sum, cat) => sum + cat.count, 0)}
              </div>
              <div className="text-sm text-gray-500">Total d'images</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
              <div className="text-sm text-gray-500">Catégories actives</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(categories.reduce((sum, cat) => sum + cat.count, 0) / categories.length)}
              </div>
              <div className="text-sm text-gray-500">Images par catégorie</div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-12 flex justify-center space-x-4">
            <BarbaLink 
              href="/admin/images-example"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors duration-200"
            >
              ← Images
            </BarbaLink>
            <BarbaLink 
              href="/admin/dashboard-example"
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md transition-colors duration-200"
            >
              Dashboard
            </BarbaLink>
          </div>
        </main>

        {/* Styles pour les animations */}
        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </BarbaPage>
  );
};

export default AdminCategoriesExample;
