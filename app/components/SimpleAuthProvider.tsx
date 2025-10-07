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

interface User {
  uid: string;
  email: string;
  role: 'admin' | 'viewer';
  displayName?: string;
  isDefaultUser?: boolean; // Nouvel indicateur pour l'utilisateur par défaut
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
  isDefaultMode: boolean; // Nouveau: indique si on est en mode par défaut
  switchToEditMode: () => void; // Nouveau: basculer vers le mode édition
}

const SimpleAuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a SimpleAuthProvider');
  }
  return context;
};

// Fonction pour déterminer le rôle basé sur l'email
const getUserRole = (email: string): 'admin' | 'viewer' => {
  const adminEmails = [
    'admin@admin.fr'
  ];
  
  return adminEmails.includes(email.toLowerCase()) ? 'admin' : 'viewer';
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Commencer connecté par défaut
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loading, setLoading] = useState(false); // Pas de loading au démarrage
  const [isDefaultMode, setIsDefaultMode] = useState(true); // Mode par défaut activé

  // Créer un utilisateur par défaut en mode viewer
  const createDefaultUser = (): User => ({
    uid: 'default-user',
    email: 'visitor@default.com',
    role: 'viewer',
    displayName: 'Visiteur',
    isDefaultUser: true
  });

  // Créer les données utilisateur basées sur l'email Firebase
  const createUserData = (firebaseUser: FirebaseUser): User => {
    const email = firebaseUser.email || '';
    const role = getUserRole(email);
    
    return {
      uid: firebaseUser.uid,
      email: email,
      role: role,
      displayName: firebaseUser.displayName || undefined,
      isDefaultUser: false
    };
  };

  // Initialiser avec l'utilisateur par défaut
  useEffect(() => {
    const defaultUser = createDefaultUser();
    setUser(defaultUser);
    setIsLoggedIn(true);
    setLoading(false);
  }, []);

  // Écouter les changements d'état d'authentification Firebase
  useEffect(() => {
    if (!auth || isDefaultMode) return; // Ne pas écouter Firebase en mode par défaut
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        const userData = createUserData(firebaseUser);
        setUser(userData);
        setIsLoggedIn(true);
        setIsDefaultMode(false);
      } else {
        // Retour au mode par défaut si déconnecté
        setFirebaseUser(null);
        const defaultUser = createDefaultUser();
        setUser(defaultUser);
        setIsLoggedIn(true);
        setIsDefaultMode(true);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isDefaultMode]);

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase not initialized');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = createUserData(userCredential.user);
      setUser(userData);
      setFirebaseUser(userCredential.user);
      setIsLoggedIn(true);
      setIsDefaultMode(false);
      setShowLoginModal(false);
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      throw new Error(error.message);
    }
  };

  // Fonction d'inscription
  const register = async (email: string, password: string, role: 'admin' | 'viewer' = 'viewer') => {
    if (!auth) throw new Error('Firebase not initialized');
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userData: User = {
        uid: userCredential.user.uid,
        email: email,
        role: getUserRole(email), // Utiliser le role basé sur l'email, pas le paramètre
        isDefaultUser: false
      };
      
      setUser(userData);
      setFirebaseUser(userCredential.user);
      setIsLoggedIn(true);
      setIsDefaultMode(false);
      setShowLoginModal(false);
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      throw new Error(error.message);
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      if (auth && firebaseUser) {
        await signOut(auth);
      }
      
      // Retour au mode par défaut
      setFirebaseUser(null);
      const defaultUser = createDefaultUser();
      setUser(defaultUser);
      setIsLoggedIn(true);
      setIsDefaultMode(true);
      setShowLoginModal(false);
    } catch (error: any) {
      console.error('Erreur de déconnexion:', error);
      throw new Error(error.message);
    }
  };

  // Basculer vers le mode édition (afficher le modal de connexion)
  const switchToEditMode = () => {
    setShowLoginModal(true);
  };

  // Déterminer si l'utilisateur a accès en écriture
  const hasWriteAccess = user?.role === 'admin' && !user?.isDefaultUser;

  const contextValue: AuthContextType = {
    isLoggedIn,
    user,
    firebaseUser,
    login,
    register,
    logout,
    showLoginModal,
    setShowLoginModal,
    hasWriteAccess,
    loading,
    isDefaultMode,
    switchToEditMode
  };

  return (
    <SimpleAuthContext.Provider value={contextValue}>
      {children}
    </SimpleAuthContext.Provider>
  );
};