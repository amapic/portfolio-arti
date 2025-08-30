"use client";

import React from 'react';
import { BarbaPage } from '../../components/BarbaTransition';
import { BarbaLink } from '../../components/BarbaLinks';

const AdminTextsExample: React.FC = () => {
  const texts = [
    { id: 1, key: 'hero.title', value: 'Bienvenue sur mon portfolio', category: 'Hero' },
    { id: 2, key: 'hero.subtitle', value: 'Découvrez mes créations artistiques', category: 'Hero' },
    { id: 3, key: 'about.title', value: 'À propos de moi', category: 'About' },
    { id: 4, key: 'contact.email', value: 'contact@monportfolio.com', category: 'Contact' },
    { id: 5, key: 'footer.copyright', value: '© 2024 Mon Portfolio. Tous droits réservés.', category: 'Footer' },
  ];

  return (
    <BarbaPage namespace="admin-texts">
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
                <h1 className="text-2xl font-bold text-gray-900">📝 Gestion des Textes</h1>
              </div>
              <nav className="flex space-x-4">
                <BarbaLink href="/admin/dashboard-example" className="text-gray-600 hover:text-gray-800">
                  Dashboard
                </BarbaLink>
                <BarbaLink href="/admin/images-example" className="text-gray-600 hover:text-gray-800">
                  Images
                </BarbaLink>
                <BarbaLink href="/admin/categories-example" className="text-gray-600 hover:text-gray-800">
                  Catégories
                </BarbaLink>
                <BarbaLink href="/admin/texts-example" className="text-purple-600 hover:text-purple-800">
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
              <h2 className="text-lg font-semibold text-gray-900">Textes du site</h2>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
                {texts.length} textes
              </span>
            </div>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors">
              + Nouveau texte
            </button>
          </div>

          {/* Liste des textes */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {texts.map((text, index) => (
                <li 
                  key={text.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animation: 'fadeInUp 0.5s ease-out forwards'
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-3">
                          {text.category}
                        </span>
                        <h3 className="text-sm font-medium text-gray-500">{text.key}</h3>
                      </div>
                      <p className="text-base text-gray-900 mt-1">{text.value}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="text-purple-600 hover:text-purple-800 px-3 py-1 rounded border border-purple-600 hover:bg-purple-50 transition-colors">
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
              <div className="text-2xl font-bold text-purple-600">{texts.length}</div>
              <div className="text-sm text-gray-500">Textes total</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-blue-600">
                {new Set(texts.map(t => t.category)).size}
              </div>
              <div className="text-sm text-gray-500">Catégories de texte</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(texts.reduce((sum, t) => sum + t.value.length, 0) / texts.length)}
              </div>
              <div className="text-sm text-gray-500">Caractères moyens</div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-12 flex justify-center space-x-4">
            <BarbaLink 
              href="/admin/categories-example"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md transition-colors duration-200"
            >
              ← Catégories
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

export default AdminTextsExample;
