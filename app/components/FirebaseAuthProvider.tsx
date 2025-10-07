"use client";

import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { FirebaseLoginModal } from './modals/FirebaseLoginModal';

interface User {
  uid: string;
  email: string;
  role: 'admin' | 'viewer';
  displayName?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  firebaseUser: FirebaseUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role?: 'admin' | 'viewer') => Promise<void>;
  logout: () => Promise<void>;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  hasWriteAccess: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Fonction pour déterminer le rôle basé sur l'email
const getUserRole = (email: string): 'admin' | 'viewer' => {
  // Définissez ici vos emails d'admin
  const adminEmails = [
    'admin@admin.fr'
  ];
  
  return adminEmails.includes(email.toLowerCase()) ? 'admin' : 'viewer';
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Créer les données utilisateur basées sur l'email (sans Firestore)
  const createUserData = (firebaseUser: FirebaseUser): User => {
    const email = firebaseUser.email || '';
    const role = getUserRole(email);
    
    return {
      uid: firebaseUser.uid,
      email: email,
      role: role,
      displayName: firebaseUser.displayName || undefined
    };
  };

  // Écouter les changements d'état d'authentification
  useEffect(() => {
    if (!auth) return; // Ne pas s'initialiser si Firebase n'est pas prêt
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        const userData = createUserData(firebaseUser);
        setUser(userData);
        setIsLoggedIn(true);
      } else {
        setFirebaseUser(null);
        setUser(null);
        setIsLoggedIn(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase non initialisé');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = createUserData(userCredential.user);
      setUser(userData);
      setIsLoggedIn(true);
      setShowLoginModal(false);
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      throw new Error(error.message);
    }
  };

  // Fonction d'inscription
  const register = async (email: string, password: string, role: 'admin' | 'viewer' = 'viewer') => {
    if (!auth) throw new Error('Firebase non initialisé');
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      const userData: User = {
        uid: userCredential.user.uid,
        email: email,
        role: getUserRole(email) // Utiliser le role basé sur l'email, pas le paramètre
      };
      
      setUser(userData);
      setIsLoggedIn(true);
      setShowLoginModal(false);
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      throw new Error(error.message);
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    if (!auth) throw new Error('Firebase non initialisé');
    
    try {
      await signOut(auth);
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  // Calculer les permissions d'écriture
  const hasWriteAccess = user?.role === 'admin';

  const value: AuthContextType = {
    isLoggedIn,
    user,
    firebaseUser,
    login,
    register,
    logout,
    showLoginModal,
    setShowLoginModal,
    hasWriteAccess,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {showLoginModal && (
        <FirebaseLoginModal 
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </AuthContext.Provider>
  );
};