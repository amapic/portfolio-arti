"use client";

import React, { useState, useEffect, createContext, useContext } from 'react';
import { LoginModal } from './modals/LoginModal';

interface AuthContextType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Vérifier l'état de connexion au chargement
  useEffect(() => {
    const checkAuthStatus = () => {
      const authStatus = localStorage.getItem('adminLoggedIn');
      const authTimestamp = localStorage.getItem('adminLoginTime');
      
      if (authStatus === 'true' && authTimestamp) {
        const loginTime = parseInt(authTimestamp);
        const currentTime = Date.now();
        const hoursPassed = (currentTime - loginTime) / (1000 * 60 * 60);
        
        if (hoursPassed < 24) {
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem('adminLoggedIn');
          localStorage.removeItem('adminLoginTime');
          setShowLoginModal(true);
        }
      } else {
        setShowLoginModal(true);
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = () => {
    setIsLoggedIn(true);
    localStorage.setItem('adminLoggedIn', 'true');
    localStorage.setItem('adminLoginTime', Date.now().toString());
    setShowLoginModal(false);
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminLoginTime');
    setShowLoginModal(true);
  };

  const handleLogin = (success: boolean) => {
    if (success) {
      login();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4">Chargement...</span>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, showLoginModal, setShowLoginModal }}>
      {children}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
        />
      )}
    </AuthContext.Provider>
  );
};
