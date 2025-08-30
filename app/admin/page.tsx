"use client";

import React from 'react';
import BarbaLink from '../components/BarbaLink';
import BarbaWrapper from '../components/BarbaWrapper';
import { Header } from '../components/Header';
import { useAuth } from '../components/AuthProvider';
import AdminLayout from '../components/AdminLayout';
import NoSSR from '../components/NoSSR';
import PortfolioFooter from '../components/PortfolioFooter';

const AdminHomePage: React.FC = () => {
  const { logout } = useAuth();

  return (
    <NoSSR>
      <BarbaWrapper namespace="admin-dashboard">
        <div suppressHydrationWarning={true} className="min-h-screen bg-gray-50">
          <Header />
          
          <AdminLayout>
            <div className="max-w-4xl mx-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Administration - Tableau de bord
                </h1>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Déconnexion
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card Images */}
                <BarbaLink
                  href="/admin/images"
                  className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="ml-4 text-lg font-semibold text-gray-900">Images</h3>
                  </div>
                  <p className="text-gray-600">
                    Gérer le portfolio d'images, ajouter, modifier ou supprimer des œuvres
                  </p>
                </BarbaLink>

                {/* Card À propos */}
                <BarbaLink
                  href="/admin/about"
                  className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="ml-4 text-lg font-semibold text-gray-900">À propos</h3>
                  </div>
                  <p className="text-gray-600">
                    Modifier les informations de la page à propos, textes et liens
                  </p>
                </BarbaLink>

                {/* Card Contact */}
                <BarbaLink
                  href="/admin/contact"
                  className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="ml-4 text-lg font-semibold text-gray-900">Contact</h3>
                  </div>
                  <p className="text-gray-600">
                    Gérer les informations de contact et l'image associée
                  </p>
                </BarbaLink>
              </div>

              {/* Statistiques rapides */}
              <div className="mt-12 bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Accès rapide</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <BarbaLink
                    href="/admin/images"
                    className="text-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-2xl font-bold text-blue-600">📸</div>
                    <div className="text-sm text-gray-600 mt-1">Portfolio</div>
                  </BarbaLink>
                  <BarbaLink
                    href="/admin/about"
                    className="text-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-2xl font-bold text-green-600">👤</div>
                    <div className="text-sm text-gray-600 mt-1">Profil</div>
                  </BarbaLink>
                  <BarbaLink
                    href="/admin/contact"
                    className="text-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-2xl font-bold text-purple-600">📧</div>
                    <div className="text-sm text-gray-600 mt-1">Contact</div>
                  </BarbaLink>
                  <a
                    href="/romain"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-2xl font-bold text-gray-600">🌐</div>
                    <div className="text-sm text-gray-600 mt-1">Voir le site</div>
                  </a>
                </div>
              </div>
            </div>
          </AdminLayout>
          <PortfolioFooter />
        </div>
      </BarbaWrapper>
    </NoSSR>
  );
};

export default AdminHomePage;
