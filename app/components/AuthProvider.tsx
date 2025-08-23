"use client";

import React, { useState, useEffect, createContext, useContext } from 'react';
import { LoginModal } from './modals/LoginModal';

interface User {
  username: string;
  role: 'admin' | 'viewer';
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: () => void;
  logout: () => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  hasWriteAccess: boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Vérifier l'état de connexion au chargement
  useEffect(() => {
    const checkAuthStatus = () => {
      const authStatus = localStorage.getItem('adminLoggedIn');
      const authTimestamp = localStorage.getItem('adminLoginTime');
      const userData = localStorage.getItem('adminUser');
      
      if (authStatus === 'true' && authTimestamp && userData) {
        const loginTime = parseInt(authTimestamp);
        const currentTime = Date.now();
        const hoursPassed = (currentTime - loginTime) / (1000 * 60 * 60);
        
        if (hoursPassed < 24) {
          setIsLoggedIn(true);
          setUser(JSON.parse(userData));
        } else {
          localStorage.removeItem('adminLoggedIn');
          localStorage.removeItem('adminLoginTime');
          localStorage.removeItem('adminUser');
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

  const loginWithUser = (userData: User) => {
    setIsLoggedIn(true);
    setUser(userData);
    localStorage.setItem('adminLoggedIn', 'true');
    localStorage.setItem('adminLoginTime', Date.now().toString());
    localStorage.setItem('adminUser', JSON.stringify(userData));
    setShowLoginModal(false);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminLoginTime');
    localStorage.removeItem('adminUser');
    setShowLoginModal(true);
  };

  const handleLogin = (success: boolean, userData?: User) => {
    if (success && userData) {
      loginWithUser(userData);
    }
  };

  const hasWriteAccess = user?.role === 'admin';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-black">Chargement...</span>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      user,
      login, 
      logout, 
      showLoginModal, 
      setShowLoginModal, 
      hasWriteAccess 
    }}>
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
