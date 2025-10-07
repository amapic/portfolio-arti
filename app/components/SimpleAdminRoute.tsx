"use client";

import React from 'react';
import { useAuth } from './SimpleAuthProvider';
import { FirebaseLoginModal } from './modals/FirebaseLoginModal';

interface SimpleAdminRouteProps {
  children: React.ReactNode;
}

export const SimpleAdminRoute: React.FC<SimpleAdminRouteProps> = ({ children }) => {
  const { 
    loading, 
    user, 
    showLoginModal, 
    setShowLoginModal,
    isDefaultMode,
    hasWriteAccess,
    switchToEditMode
  } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Barre d'information en mode viewer par défaut */}
      {isDefaultMode && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="text-sm text-blue-700 font-medium">
                  Mode consultation
                </span>
              </div>
              <span className="text-sm text-blue-600">
                Vous consultez l'interface d'administration en lecture seule
              </span>
            </div>
            <button
              onClick={switchToEditMode}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md transition-colors"
            >
              Passer en mode édition
            </button>
          </div>
        </div>
      )}

      {/* Barre d'information pour les utilisateurs connectés sans droits d'écriture */}
      {!isDefaultMode && !hasWriteAccess && (
        <div className="bg-orange-50 border-b border-orange-200 px-4 py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="inline-block w-2 h-2 bg-orange-500 rounded-full"></span>
                <span className="text-sm text-orange-700 font-medium">
                  Connecté en lecture seule
                </span>
              </div>
              <span className="text-sm text-orange-600">
                Votre compte ({user?.email}) n'a pas les droits de modification
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Barre d'information pour les administrateurs */}
      {!isDefaultMode && hasWriteAccess && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm text-green-700 font-medium">
                  Mode administrateur
                </span>
              </div>
              <span className="text-sm text-green-600">
                Connecté en tant que {user?.email} avec droits de modification
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      {children}

      {/* Modal de connexion */}
      {showLoginModal && (
        <FirebaseLoginModal 
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
};