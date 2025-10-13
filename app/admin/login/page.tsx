"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../../components/Header';
import { useAuth } from '../../components/SimpleAuthProvider';
import NoSSR from '../../components/NoSSR';
import PortfolioFooter from '../../components/PortfolioFooter';

const AdminLoginPage: React.FC = () => {
  const router = useRouter();
  const { user, hasWriteAccess, switchToEditMode, isDefaultMode } = useAuth();

  // Si l'utilisateur est déjà admin connecté, rediriger vers le dashboard
  useEffect(() => {
    if (hasWriteAccess && !isDefaultMode) {
      router.push('/admin');
    }
  }, [hasWriteAccess, isDefaultMode, router]);

  return (
    <NoSSR>
      <div suppressHydrationWarning={true}>
        <div className="min-h-screen bg-gray-50">
          <Header />
          
          <div className="pt-20 min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full mx-auto">
              <div className="bg-white rounded-lg shadow-md p-8">
                <div className="text-center mb-6">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Connexion Administrateur
                  </h1>
                  <p className="text-gray-600">
                    Connectez-vous pour accéder aux fonctionnalités d'administration avec droits de modification.
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={switchToEditMode}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
                  >
                    Se connecter avec Firebase
                  </button>
                  
                  <div className="text-center">
                    <button
                      onClick={() => router.push('/admin')}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Continuer en mode consultation seulement
                    </button>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-md">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Informations</h3>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Mode consultation : Accès en lecture seule</li>
                    <li>• Mode administrateur : Droits de modification</li>
                    <li>• Connexion sécurisée via Firebase</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <PortfolioFooter />
        </div>
      </div>
    </NoSSR>
  );
};

export default AdminLoginPage;