'use client'

import { HiOutlineDocumentSearch , HiOutlineCog,HiDocumentAdd, HiOutlineAcademicCap } from "react-icons/hi";
import { HiOutlineEnvelope,HiOutlineWrenchScrewdriver,HiOutlineDocumentArrowUp   } from "react-icons/hi2";
import { FaLinkedin } from "react-icons/fa";
import { HiOutlineDocumentArrowDown } from "react-icons/hi2";
import { HiOutlineChartBar } from "react-icons/hi2";
import { HiOutlineCircleStack } from "react-icons/hi2";
import Image from 'next/image';
import React,{ useState,useEffect } from 'react';
import { IconType } from 'react-icons';
import * as Hi2Icons from 'react-icons/hi2';
import { HiOutlinePlusCircle } from 'react-icons/hi2';
import { HiOutlineTrash } from "react-icons/hi2";

interface Card {
  id: string;
  icon: string; // Nom de l'icône
  title: string;
  content: string;
}

// Nouveau composant pour la modal de sélection d'icônes
const IconSelectorModal = ({ 
  onSelect, 
  onClose,
  currentIcon 
}: { 
  onSelect: (iconName: string) => void;
  onClose: () => void;
  currentIcon: string;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(currentIcon);

  // Filtrer les icônes outline
  const outlineIcons = Object.entries(Hi2Icons)
    .filter(([name]) => name.startsWith('HiOutline'))
    .filter(([name]) => 
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Sélectionner une icône</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Rechercher une icône..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Grille d'icônes */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4 overflow-y-auto flex-grow">
          {outlineIcons.map(([name, Icon]) => (
            <button
              key={name}
              onClick={() => {
                setSelectedIcon(name);
                onSelect(name);
                onClose();
              }}
              className={`p-4 rounded-lg flex flex-col items-center gap-2 transition-colors
                ${selectedIcon === name 
                  ? 'bg-blue-100 dark:bg-blue-900' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              <Icon className="text-2xl text-blue-600" />
              <span className="text-xs text-center break-all">
                {name.replace('HiOutline', '')}
              </span>
            </button>
          ))}
        </div>

        <div className="flex gap-2 justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  // Définition des longueurs maximales pour chaque champ
  const MAX_LENGTHS = {
    mainTitle: 50,
    subtitle: 120,
    documentumText: 40,
    headerName: 30,
    headerRole: 20
  };

  const [texts, setTexts] = useState({
    mainTitle: "",
    subtitle: "",
    documentumText: "",
    headerName: "",
    headerRole: ""
  });
  const [titleError, setTitleError] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [editingStates, setEditingStates] = useState({
    mainTitle: false,
    headerName: false,
    subtitle: false,
    documentumText: false
  });
  const [cards, setCards] = useState<Card[]>([]);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);

  // Au début du composant, ajoutez une constante pour l'URL de l'API
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/api/texts`)
      .then(res => res.json())
      .then(data => setTexts(data))
      .catch(error => console.error('Error loading texts:', error));
  }, []);

  // Charger les cartes au démarrage
  useEffect(() => {
    fetch(`${API_URL}/api/cards`)
      .then(res => res.json())
      .then(data => setCards(data))
      .catch(error => console.error('Error loading cards:', error));
  }, []);

  // Fonction helper pour vérifier la longueur
  const checkLength = (value: string, field: string) => {
    if (value.length > MAX_LENGTHS[field as keyof typeof MAX_LENGTHS]) {
      setTitleError(`Le texte ne doit pas dépasser ${MAX_LENGTHS[field as keyof typeof MAX_LENGTHS]} caractères`);
      return true;
    }
    setTitleError("");
    return false;
  };

  // Fonction helper pour gérer l'édition
  const toggleEditing = (field: string, value: boolean) => {
    setEditingStates(prev => ({ ...prev, [field]: value }));
    if (!value) setTitleError(""); // Reset error when canceling edit
  };

  // Modification du handleTextUpdate pour inclure la vérification de longueur
  const handleTextUpdate = async (key: string, value: string) => {
    if (checkLength(value, key)) return;

    try {
      const response = await fetch(`${API_URL}/api/texts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value }),
      });
      
      if (!response.ok) throw new Error('Failed to update text');
      
      setTexts(prev => ({ ...prev, [key]: value }));
      setEditingStates(prev => ({ ...prev, [key]: false }));
      setTitleError("");
    } catch (error) {
      console.error('Error updating text:', error);
      alert('Failed to update text. Please try again.');
    }
  };

  // Modal d'ajout de carte
  const AddCardModal = () => {
    const [newCard, setNewCard] = useState<Omit<Card, 'id'>>({
      icon: 'HiOutlineWrenchScrewdriver',
      title: '',
      content: ''
    });
    const [showIconSelector, setShowIconSelector] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cards`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCard),
        });
        
        if (!response.ok) throw new Error('Failed to add card');
        
        const savedCard = await response.json();
        setCards(prev => [...prev, savedCard]);
        setIsAddCardModalOpen(false);
      } catch (error) {
        console.error('Error adding card:', error);
        alert('Failed to add card');
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Ajouter une carte</h2>
            <button
              onClick={() => setIsAddCardModalOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Icône</label>
              <button
                type="button"
                onClick={() => setShowIconSelector(true)}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 
                  focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
              >
                {React.createElement(
                  Hi2Icons[newCard.icon as keyof typeof Hi2Icons],
                  { className: "text-2xl text-blue-600" }
                )}
                <span>{newCard.icon.replace('HiOutline', '')}</span>
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Titre</label>
              <input
                type="text"
                value={newCard.title}
                onChange={(e) => setNewCard(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                maxLength={50}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Contenu</label>
              <textarea
                value={newCard.content}
                onChange={(e) => setNewCard(prev => ({ ...prev, content: e.target.value }))}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                maxLength={200}
                rows={3}
                required
              />
            </div>
            
            <div className="flex gap-2 justify-end pt-4">
              <button
                type="button"
                onClick={() => setIsAddCardModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ajouter
              </button>
            </div>
          </form>
        </div>

        {/* Modal de sélection d'icône */}
        {showIconSelector && (
          <IconSelectorModal
            onSelect={(iconName) => {
              setNewCard(prev => ({ ...prev, icon: iconName }));
            }}
            onClose={() => setShowIconSelector(false)}
            currentIcon={newCard.icon}
          />
        )}
      </div>
    );
  };

  // Modal de confirmation de suppression
  const DeleteConfirmationModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold mb-6">Confirmer la suppression</h2>
          <p className="mb-6">Êtes-vous sûr de vouloir supprimer cette carte ?</p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
            >
              Annuler
            </button>
            <button
              onClick={async () => {
                if (!cardToDelete) return;
                try {
                  const response = await fetch(`${API_URL}/api/cards/${cardToDelete}`, {
                    method: 'DELETE',
                  });
                  
                  if (!response.ok) throw new Error('Failed to delete card');
                  
                  setCards(prev => prev.filter(card => card.id !== cardToDelete));
                  setIsDeleteModalOpen(false);
                  setCardToDelete(null);
                } catch (error) {
                  console.error('Error deleting card:', error);
                  alert('Failed to delete card');
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="w-full px-8 py-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm fixed top-0 z-50 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            {isLoggedIn && !editingStates.headerName ? (
              <div className="group relative">
                <h1 className="text-2xl font-bold">{texts.headerName}</h1>
                <p className="text-gray-600 dark:text-gray-400">{texts.headerRole}</p>
                <button
                  onClick={() => toggleEditing('headerName', true)}
                  className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✏️
                </button>
              </div>
            ) : isLoggedIn && editingStates.headerName ? (
              <div className="space-y-2">
                <div className="flex gap-2 items-start">
                  <div>
                    <input
                      type="text"
                      value={texts.headerName}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setTexts(prev => ({ ...prev, headerName: newValue }));
                        checkLength(newValue, 'headerName');
                      }}
                      className={`text-2xl font-bold bg-transparent border-b-2 
                        ${titleError ? 'border-red-500' : 'border-blue-500'} 
                        focus:outline-none focus:border-blue-700 w-full mb-2`}
                      autoFocus
                    />
                    <input
                      type="text"
                      value={texts.headerRole}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setTexts(prev => ({ ...prev, headerRole: newValue }));
                        checkLength(newValue, 'headerRole');
                      }}
                      className="text-gray-600 dark:text-gray-400 bg-transparent border-b-2 border-blue-500 focus:outline-none focus:border-blue-700 w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        handleTextUpdate('headerName', texts.headerName);
                        handleTextUpdate('headerRole', texts.headerRole);
                        toggleEditing('headerName', false);
                      }}
                      className={`px-4 py-2 ${
                        titleError 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white rounded-lg transition-colors`}
                      disabled={!!titleError}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => toggleEditing('headerName', false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                
                {titleError && (
                  <div className="text-red-500 text-sm">
                    {titleError}
                  </div>
                )}
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold">{texts.headerName}</h1>
                <p className="text-gray-600 dark:text-gray-400">{texts.headerRole}</p>
              </>
            )}
          </div>
          <div className="flex gap-6">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <HiOutlineCog className="text-xl" />
              Connexion & {isLoggedIn ? "✅" : "❌"}
            </button>
            <a
              href="/path-to-your-cv.pdf"
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <HiOutlineDocumentArrowDown className="text-xl" />
              CV
            </a>
            <a
              href="https://www.linkedin.com/in/amaurypichat/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaLinkedin className="text-xl" />
              LinkedIn
            </a>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
            
            <h2 className="text-2xl font-bold mb-6">Connexion</h2>
            
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              // Ici, vous devriez implémenter la vraie logique d'authentification
              // Ceci est juste un exemple
              setIsLoggedIn(!isLoggedIn);
              setIsLoginModalOpen(false);
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="votre@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mot de passe
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Se connecter
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-32 px-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <section className="mb-20">
            {isLoggedIn && !editingStates.mainTitle ? (
              <div className="group relative">
                <h2 className="text-4xl font-bold mb-6">{texts.mainTitle}</h2>
                <button
                  onClick={() => toggleEditing('mainTitle', true)}
                  className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✏️
                </button>
              </div>
            ) : isLoggedIn && editingStates.mainTitle ? (
              <div className="space-y-2">
                <div className="flex gap-2 items-start">
                  <input
                    type="text"
                    value={texts.mainTitle}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setTexts(prev => ({ ...prev, mainTitle: newTitle }));
                      if (newTitle.length > MAX_LENGTHS.mainTitle) {
                        setTitleError(`Le titre ne doit pas dépasser ${MAX_LENGTHS.mainTitle} caractères`);
                      } else {
                        setTitleError("");
                      }
                    }}
                    className={`text-4xl font-bold bg-transparent border-b-2 
                      ${titleError ? 'border-red-500' : 'border-blue-500'} 
                      focus:outline-none focus:border-blue-700 w-full`}
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      handleTextUpdate('mainTitle', texts.mainTitle);
                      toggleEditing('mainTitle', false);
                    }}
                    className={`px-4 py-2 ${
                      titleError 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white rounded-lg transition-colors`}
                    disabled={!!titleError}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => toggleEditing('mainTitle', false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                
                {titleError && (
                  <div className="text-red-500 text-sm">
                    {titleError}
                  </div>
                )}
                
                <div className={`text-sm ${
                  texts.mainTitle.length > MAX_LENGTHS.mainTitle 
                    ? 'text-red-500' 
                    : 'text-gray-500'
                }`}>
                  {texts.mainTitle.length}/{MAX_LENGTHS.mainTitle} caractères
                </div>
              </div>
            ) : (
              <h2 className="text-4xl font-bold mb-6">{texts.mainTitle}</h2>
            )}
            
            {isLoggedIn && !editingStates.subtitle ? (
              <div className="group relative">
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mb-4">
                  {texts.subtitle}
                </p>
                <button
                  onClick={() => toggleEditing('subtitle', true)}
                  className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✏️
                </button>
              </div>
            ) : isLoggedIn && editingStates.subtitle ? (
              <div className="space-y-2">
                <div className="flex gap-2 items-start">
                  <input
                    type="text"
                    value={texts.subtitle}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setTexts(prev => ({ ...prev, subtitle: newValue }));
                      if (newValue.length > MAX_LENGTHS.subtitle) {
                        setTitleError(`Le texte ne doit pas dépasser ${MAX_LENGTHS.subtitle} caractères`);
                      } else {
                        setTitleError("");
                      }
                    }}
                    className={`text-xl text-gray-600 dark:text-gray-400 bg-transparent border-b-2 
                      ${titleError ? 'border-red-500' : 'border-blue-500'} 
                      focus:outline-none focus:border-blue-700 w-full`}
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      handleTextUpdate('subtitle', texts.subtitle);
                      toggleEditing('subtitle', false);
                    }}
                    className={`px-4 py-2 ${
                      titleError 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white rounded-lg transition-colors`}
                    disabled={!!titleError}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => toggleEditing('subtitle', false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                
                {titleError && (
                  <div className="text-red-500 text-sm">
                    {titleError}
                  </div>
                )}
                
                <div className={`text-sm ${
                  texts.subtitle.length > MAX_LENGTHS.subtitle 
                    ? 'text-red-500' 
                    : 'text-gray-500'
                }`}>
                  {texts.subtitle.length}/{MAX_LENGTHS.subtitle} caractères
                </div>
              </div>
            ) : (
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mb-4">
                {texts.subtitle}
              </p>
            )}
            
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <HiOutlineAcademicCap className="text-xl" />
              {isLoggedIn && !editingStates.documentumText ? (
                <div className="group relative">
                  <p className="text-lg">
                    {texts.documentumText}
                  </p>
                  <button
                    onClick={() => toggleEditing('documentumText', true)}
                    className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✏️
                  </button>
                </div>
              ) : isLoggedIn && editingStates.documentumText ? (
                <div className="space-y-2">
                  <div className="flex gap-2 items-start">
                    <input
                      type="text"
                      value={texts.documentumText}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setTexts(prev => ({ ...prev, documentumText: newValue }));
                        if (newValue.length > MAX_LENGTHS.documentumText) {
                          setTitleError(`Le texte ne doit pas dépasser ${MAX_LENGTHS.documentumText} caractères`);
                        } else {
                          setTitleError("");
                        }
                      }}
                      className={`text-lg bg-transparent border-b-2 
                        ${titleError ? 'border-red-500' : 'border-blue-500'} 
                        focus:outline-none focus:border-blue-700 w-full`}
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        handleTextUpdate('documentumText', texts.documentumText);
                        toggleEditing('documentumText', false);
                      }}
                      className={`px-4 py-2 ${
                        titleError 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white rounded-lg transition-colors`}
                      disabled={!!titleError}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => toggleEditing('documentumText', false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  
                  {titleError && (
                    <div className="text-red-500 text-sm">
                      {titleError}
                    </div>
                  )}
                  
                  <div className={`text-sm ${
                    texts.documentumText.length > MAX_LENGTHS.documentumText 
                      ? 'text-red-500' 
                      : 'text-gray-500'
                  }`}>
                    {texts.documentumText.length}/{MAX_LENGTHS.documentumText} caractères
                  </div>
                </div>
              ) : (
                <p className="text-lg">
                  {texts.documentumText}
                </p>
              )}
            </div>
          </section>

          {/* Services Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {cards.map(card => {
              const IconComponent = Hi2Icons[card.icon as keyof typeof Hi2Icons] as IconType;
              return (
                <div key={card.id} 
                  className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 
                    transition-all duration-500 ease-out
                    transform perspective-1000 hover:scale-105 hover:shadow-xl
                    relative group
                    before:absolute before:inset-0 before:z-[-1] before:transition-all before:duration-500
                    before:bg-gradient-to-r before:from-blue-50 before:to-blue-100 dark:before:from-blue-900/20 dark:before:to-blue-800/20
                    before:opacity-0 hover:before:opacity-100 before:rounded-xl"
                >
                  {/* Bouton de suppression */}
                  {isLoggedIn && (
                    <button
                      onClick={() => {
                        setCardToDelete(card.id);
                        setIsDeleteModalOpen(true);
                      }}
                      className="absolute top-2 right-2 p-2 text-red-500 opacity-0 group-hover:opacity-100 
                        transition-opacity hover:text-red-700 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"
                      aria-label="Supprimer la carte"
                    >
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                  )}
                  
                  <div className="text-blue-600 mb-4">
                    <IconComponent className="text-4xl" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{card.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{card.content}</p>
                </div>
              );
            })}
            
            {/* Bouton d'ajout pour l'admin */}
            {isLoggedIn && (
              <button
                onClick={() => setIsAddCardModalOpen(true)}
                className="p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600
                  hover:border-blue-500 dark:hover:border-blue-500
                  transition-colors flex flex-col items-center justify-center gap-4
                  text-gray-500 dark:text-gray-400 hover:text-blue-500
                  transform perspective-1000 hover:scale-105"
              >
                <HiOutlinePlusCircle className="text-4xl" />
                <span>Ajouter une carte</span>
              </button>
            )}
          </section>

          {/* Contact Section */}
          <section className="mb-20">
            <div className="p-8 rounded-xl bg-gray-100 dark:bg-gray-800">
              <h2 className="text-2xl font-bold mb-4">Démarrons votre projet</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Contactez-moi pour discuter de vos besoins en gestion documentaire.
              </p>
              <a
                href="mailto:amaury.pichat@gmail.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <HiOutlineEnvelope className="text-xl" />
                Me contacter
              </a>
            </div>
          </section>
        </div>
      </main>

      {/* Professional Experience Section */}
      <section id="experience" className="py-20 px-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">Expérience Professionnelle</h2>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <div className="flex flex-col md:flex-row justify-between mb-6">
              <div>
                <h3 className="text-2xl font-semibold mb-2">Administrateur National</h3>
                <div className="flex items-center gap-2">
                  <p className="text-xl text-blue-600 dark:text-blue-400">EDF et Coexya</p>
                  <Image 
                    src="/edf.png"
                    alt="Logo EDF"
                    width={30}
                    height={30}
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                <p>Villeurbanne - Lyon</p>
                <p>5 années</p>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <p className="">
                Développement et traitement de données en autonomie pour la GED du nucléaire
              </p>
              <p className="mb-6">
                <span className="text-blue-600 font-semibold">➜</span> 10 000 ingénieur du nucléaires, 8 millions de documents
              </p>

              <h4 className="text-lg font-semibold mb-4">Réalisations principales :</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Refonte majeure de la base documentaire : migration et restructuration de 4 millions de documents</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Pilotage du projet de dématérialisation : conversion de 100 000+ documents physiques en format numérique</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Développement d'une interface web moderne pour l'accès à la GED, améliorant l'expérience utilisateur</span>
                </li>
               
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Gestion de projet agile : Product Owner sur une application web stratégique, coordination d'une équipe de 4 développeurs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Accompagnement des utilisateurs lors du déploiement de nouvelles solutions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Gestion des incidents critiques : support niveau 2, résolution des problèmes complexes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Formation des autres administrateurs</span>
                </li>
              </ul>

              <h4 className="text-lg font-semibold mt-6 mb-4">Technologies et outils utilisés :</h4>
              <div className="flex flex-wrap gap-2">
                {['Documentum', 'VBA', 'Web (Js, React)', 'Python'].map((tech) => (
                  <span 
                    key={tech}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Formation Section */}
      <section id="formation" className="py-20 px-8 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">Formation</h2>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <div className="flex flex-col md:flex-row justify-between mb-6">
              <div>
                <h3 className="text-2xl font-semibold mb-2">Diplôme d'Ingénieur Généraliste</h3>
                <p className="text-xl text-blue-600 dark:text-blue-400 mb-2">ECAM Lyon</p>
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                <p>2017 - 2022</p>
                <p>Lyon</p>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <p className="mb-6">
                Formation d'ingénieur généraliste avec une spécialisation en informatique et systèmes d'information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Menu */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <a 
          href="#experience" 
          className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 flex items-center gap-2 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
        >
          <HiOutlineDocumentSearch className="text-xl text-blue-600" />
          <span className="pr-2">Expérience</span>
        </a>
        <a 
          href="#formation" 
          className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 flex items-center gap-2 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
        >
          <HiOutlineAcademicCap className="text-xl text-blue-600" />
          <span className="pr-2">Formation</span>
        </a>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 py-8 px-8">
        <div className="max-w-6xl mx-auto text-center text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} Amaury PICHAT - Consultant GED
        </div>
      </footer>

      {isAddCardModalOpen && <AddCardModal />}
      {isDeleteModalOpen && <DeleteConfirmationModal />}
    </div>
  );
}