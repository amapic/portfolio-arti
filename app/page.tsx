"use client";

import {
  HiOutlineDocumentSearch,
  HiOutlineCog,
  HiDocumentAdd,
  HiOutlineAcademicCap,
  HiOutlineLogout,
  HiOutlineCheck,
  HiOutlineX
} from "react-icons/hi";
import {
  HiOutlineEnvelope,
  HiOutlineWrenchScrewdriver,
  HiOutlineDocumentArrowUp,
} from "react-icons/hi2";
import { FaLinkedin } from "react-icons/fa";
import { HiOutlineDocumentArrowDown } from "react-icons/hi2";
import { HiOutlineChartBar } from "react-icons/hi2";
import { HiOutlineCircleStack } from "react-icons/hi2";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { IconType } from "react-icons";
import * as Hi2Icons from "react-icons/hi2";
import { HiOutlinePlusCircle } from "react-icons/hi2";
import { HiOutlineTrash } from "react-icons/hi2";
import { ExperienceSection } from "./components/experience/ExperienceSection";
import { AddExperienceModal } from "./components/modals/AddExperienceModal";
import { Experience } from "./types/experience";
import { api } from "./services/api";
import { HiOutlinePencil } from "react-icons/hi2";
import { LoginModal } from "./components/modals/LoginModal";
import { EditExperienceModal } from './components/modals/EditExperienceModal';
import { DarkModeToggle } from './components/DarkModeToggle';

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
  currentIcon,
}: {
  onSelect: (iconName: string) => void;
  onClose: () => void;
  currentIcon: string;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(currentIcon);

  // Filtrer les icônes outline
  const outlineIcons = Object.entries(Hi2Icons)
    .filter(([name]) => name.startsWith("HiOutline"))
    .filter(([name]) => name.toLowerCase().includes(searchTerm.toLowerCase()));

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
                ${
                  selectedIcon === name
                    ? "bg-blue-100 dark:bg-blue-900"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }
              `}
            >
              <Icon className="text-2xl text-blue-600" />
              <span className="text-xs text-center break-all">
                {name.replace("HiOutline", "")}
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

// Modifiez l'interface des textes pour inclure cvUrl et linkedInUrl
interface Texts {
  mainTitle: string;
  subtitle: string;
  documentumText: string;
  headerName: string;
  headerRole: string;
  cvUrl: string;
  linkedInUrl: string;
  contactEmail: string;
}

export default function Home() {
  // Définition des longueurs maximales pour chaque champ
  const MAX_LENGTHS = {
    mainTitle: 50,
    subtitle: 120,
    documentumText: 40,
    headerName: 30,
    headerRole: 20,
    contactEmail: 100,
  };

  // Modifiez l'état initial des textes
  const [texts, setTexts] = useState<Texts>({
    mainTitle: "",
    subtitle: "",
    documentumText: "",
    headerName: "",
    headerRole: "",
    cvUrl: "/path-to-your-cv.pdf",
    linkedInUrl: "https://www.linkedin.com/in/amaurypichat/",
    contactEmail: "",
  });
  const [titleError, setTitleError] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [editingStates, setEditingStates] = useState({
    mainTitle: false,
    headerName: false,
    subtitle: false,
    documentumText: false,
    contactEmail: false,
  });
  const [cards, setCards] = useState<Card[]>([]);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isAddExperienceModalOpen, setIsAddExperienceModalOpen] =
    useState(false);
  const [isDeleteExperienceModalOpen, setIsDeleteExperienceModalOpen] =
    useState(false);
  const [experienceToDelete, setExperienceToDelete] = useState<string | null>(
    null
  );
  const [isEditingCvUrl, setIsEditingCvUrl] = useState(false);
  const [isEditingLinkedInUrl, setIsEditingLinkedInUrl] = useState(false);
  const [isEditingExperience, setIsEditingExperience] = useState(false);
  const [experienceToEdit, setExperienceToEdit] = useState<Experience | null>(
    null
  );
  const [isEditingContact, setIsEditingContact] = useState(false);

  // Au début du composant, ajoutez une constante pour l'URL de l'API
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/api/texts`)
      .then((res) => res.json())
      .then((data) => setTexts(data))
      .catch((error) => console.error("Error loading texts:", error));
  }, []);

  // Charger les cartes au démarrage
  useEffect(() => {
    fetch(`${API_URL}/api/cards`)
      .then((res) => res.json())
      .then((data) => setCards(data))
      .catch((error) => console.error("Error loading cards:", error));
  }, []);

  // Charger les expériences au démarrage
  useEffect(() => {
    api.experiences.getAll().then(setExperiences);
  }, []);

  // Fonction helper pour vérifier la longueur
  const checkLength = (value: string, field: string) => {
    if (value.length > MAX_LENGTHS[field as keyof typeof MAX_LENGTHS]) {
      setTitleError(
        `Le texte ne doit pas dépasser ${
          MAX_LENGTHS[field as keyof typeof MAX_LENGTHS]
        } caractères`
      );
      return true;
    }
    setTitleError("");
    return false;
  };

  // Fonction helper pour gérer l'édition
  const toggleEditing = (field: string, value: boolean) => {
    setEditingStates((prev) => ({ ...prev, [field]: value }));
    if (!value) setTitleError(""); // Reset error when canceling edit
  };

  // Modification du handleTextUpdate pour inclure la vérification de longueur
  const handleTextUpdate = async (key: string, value: string) => {
    if (checkLength(value, key)) return;

    try {
      const response = await fetch(`${API_URL}/api/texts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key, value }),
      });

      if (!response.ok) throw new Error("Failed to update text");

      setTexts((prev) => ({ ...prev, [key]: value }));
      setEditingStates((prev) => ({ ...prev, [key]: false }));
      setTitleError("");
    } catch (error) {
      console.error("Error updating text:", error);
      alert("Failed to update text. Please try again.");
    }
  };

  // Modal d'ajout de carte
  const AddCardModal = () => {
    const [newCard, setNewCard] = useState<Omit<Card, "id">>({
      icon: "HiOutlineWrenchScrewdriver",
      title: "",
      content: "",
    });
    const [showIconSelector, setShowIconSelector] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/cards`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newCard),
          }
        );

        if (!response.ok) throw new Error("Failed to add card");

        const savedCard = await response.json();
        setCards((prev) => [...prev, savedCard]);
        setIsAddCardModalOpen(false);
      } catch (error) {
        console.error("Error adding card:", error);
        alert("Failed to add card");
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
                <span>{newCard.icon.replace("HiOutline", "")}</span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Titre</label>
              <input
                type="text"
                value={newCard.title}
                onChange={(e) =>
                  setNewCard((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                maxLength={50}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Contenu</label>
              <textarea
                value={newCard.content}
                onChange={(e) =>
                  setNewCard((prev) => ({ ...prev, content: e.target.value }))
                }
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
              setNewCard((prev) => ({ ...prev, icon: iconName }));
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
          <p className="mb-6">
            Êtes-vous sûr de vouloir supprimer cette carte ?
          </p>
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
                  const response = await fetch(
                    `${API_URL}/api/cards/${cardToDelete}`,
                    {
                      method: "DELETE",
                    }
                  );

                  if (!response.ok) throw new Error("Failed to delete card");

                  setCards((prev) =>
                    prev.filter((card) => card.id !== cardToDelete)
                  );
                  setIsDeleteModalOpen(false);
                  setCardToDelete(null);
                } catch (error) {
                  console.error("Error deleting card:", error);
                  alert("Failed to delete card");
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

  const DeleteExperienceConfirmationModal = ({
    onConfirm,
    onCancel,
    message,
  }: {
    onConfirm: () => void;
    onCancel: () => void;
    message: string;
  }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
            Confirmer la suppression
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">{message}</p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 
                dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 
                transition-colors"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Ajoutez ces fonctions de gestion
  const handleDeleteExperience = (id: string) => {
    setExperienceToDelete(id);
    setIsDeleteExperienceModalOpen(true);
  };

  const handleConfirmDeleteExperience = async () => {
    if (!experienceToDelete) return;

    try {
      const response = await fetch(
        `${API_URL}/api/experiences/${experienceToDelete}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete experience");

      setExperiences((prev) =>
        prev.filter((exp) => exp.id !== experienceToDelete)
      );
      setIsDeleteExperienceModalOpen(false);
      setExperienceToDelete(null);
    } catch (error) {
      console.error("Error deleting experience:", error);
      alert("Failed to delete experience");
    }
  };

  const handleAddExperience = async (newExperience: Omit<Experience, "id">) => {
    try {
      const experience = await api.experiences.add(newExperience);
      setExperiences((prev) => [...prev, experience]);
      setIsAddExperienceModalOpen(false);
    } catch (error) {
      console.error("Error adding experience:", error);
      alert("Failed to add experience");
    }
  };

  // Modifiez la fonction handleCvUrlUpdate
  const handleCvUrlUpdate = async (newUrl: string) => {
    try {
      const response = await fetch(`${API_URL}/api/texts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: "cvUrl", value: newUrl }),
      });

      if (!response.ok) throw new Error("Failed to update CV URL");

      setTexts((prev) => ({ ...prev, cvUrl: newUrl }));
      setIsEditingCvUrl(false);
    } catch (error) {
      console.error("Error updating CV URL:", error);
      alert("Failed to update CV URL");
    }
  };

  const handleLinkedInUrlUpdate = async (newUrl: string) => {
    try {
      const response = await fetch(`${API_URL}/api/texts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: "linkedInUrl", value: newUrl }),
      });

      if (!response.ok) throw new Error("Failed to update LinkedIn URL");

      setTexts((prev) => ({ ...prev, linkedInUrl: newUrl }));
      setIsEditingLinkedInUrl(false);
    } catch (error) {
      console.error("Error updating LinkedIn URL:", error);
      alert("Failed to update LinkedIn URL");
    }
  };

  const handleEditExperience = async (updatedExperience: Experience) => {
    try {
      const response = await fetch(
        `${API_URL}/api/experiences/${updatedExperience.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedExperience),
        }
      );

      if (!response.ok) throw new Error("Failed to update experience");

      const updated = await response.json();
      setExperiences((prev) =>
        prev.map((exp) => (exp.id === updated.id ? updated : exp))
      );
      setIsEditingExperience(false);
      setExperienceToEdit(null);
    } catch (error) {
      console.error("Error updating experience:", error);
      alert("Failed to update experience");
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
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
                <p className="text-gray-600 dark:text-gray-400">
                  {texts.headerRole}
                </p>
                <button
                  onClick={() => toggleEditing("headerName", true)}
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
                        setTexts((prev) => ({ ...prev, headerName: newValue }));
                        checkLength(newValue, "headerName");
                      }}
                      className={`text-2xl font-bold bg-transparent border-b-2 
                        ${titleError ? "border-red-500" : "border-blue-500"} 
                        focus:outline-none focus:border-blue-700 w-full mb-2`}
                      autoFocus
                    />
                    <input
                      type="text"
                      value={texts.headerRole}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setTexts((prev) => ({ ...prev, headerRole: newValue }));
                        checkLength(newValue, "headerRole");
                      }}
                      className="text-gray-600 dark:text-gray-400 bg-transparent border-b-2 border-blue-500 focus:outline-none focus:border-blue-700 w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        handleTextUpdate("headerName", texts.headerName);
                        handleTextUpdate("headerRole", texts.headerRole);
                        toggleEditing("headerName", false);
                      }}
                      className={`px-4 py-2 ${
                        titleError
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      } text-white rounded-lg transition-colors`}
                      disabled={!!titleError}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => toggleEditing("headerName", false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {titleError && (
                  <div className="text-red-500 text-sm">{titleError}</div>
                )}
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold">{texts.headerName}</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {texts.headerRole}
                </p>
              </>
            )}
          </div>
          <div className="flex gap-6">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 
                  hover:bg-red-50 dark:hover:bg-red-900/20 
                  text-red-600 dark:text-red-400
                  transition-colors flex items-center gap-2"
              >
                <HiOutlineLogout className="text-xl" />
                Déconnexion
              </button>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 
                  hover:bg-gray-100 dark:hover:bg-gray-800 
                  transition-colors flex items-center gap-2"
              >
                <HiOutlineCog className="text-xl" />
                Connexion
              </button>
            )}
            {isLoggedIn && isEditingCvUrl ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={texts.cvUrl}
                  onChange={(e) =>
                    setTexts((prev) => ({ ...prev, cvUrl: e.target.value }))
                  }
                  className="px-4 py-2 rounded-lg border border-blue-500 dark:border-blue-400 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="URL du CV"
                />
                <button
                  onClick={() => handleCvUrlUpdate(texts.cvUrl)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditingCvUrl(false);
                    setTexts((prev) => ({ ...prev, cvUrl: prev.cvUrl })); // Reset to previous value
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <a
                  href={texts.cvUrl}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 
                    hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors 
                    flex items-center gap-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <HiOutlineDocumentArrowDown className="text-xl" />
                  CV
                </a>
                {isLoggedIn && (
                  <button
                    onClick={() => setIsEditingCvUrl(true)}
                    className="p-2 text-blue-500 hover:text-blue-700 
                      rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50"
                    aria-label="Modifier l'URL du CV"
                  >
                    <HiOutlinePencil className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
            {isLoggedIn && isEditingLinkedInUrl ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={texts.linkedInUrl}
                  onChange={(e) =>
                    setTexts((prev) => ({
                      ...prev,
                      linkedInUrl: e.target.value,
                    }))
                  }
                  className="px-4 py-2 rounded-lg border border-blue-500 dark:border-blue-400 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="URL LinkedIn"
                />
                <button
                  onClick={() => handleLinkedInUrlUpdate(texts.linkedInUrl)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditingLinkedInUrl(false);
                    setTexts((prev) => ({
                      ...prev,
                      linkedInUrl: prev.linkedInUrl,
                    })); // Reset to previous value
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <a
                  href={texts.linkedInUrl}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaLinkedin className="text-xl" />
                  LinkedIn
                </a>
                {isLoggedIn && (
                  <button
                    onClick={() => setIsEditingLinkedInUrl(true)}
                    className="p-2 text-white hover:text-blue-100 
                      rounded-full hover:bg-blue-700"
                    aria-label="Modifier l'URL LinkedIn"
                  >
                    <HiOutlinePencil className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
            <DarkModeToggle />
          </div>
        </div>
      </header>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <LoginModal
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={(success) => {
            if (success) {
              setIsLoggedIn(true);
              setIsLoginModalOpen(false);
            }
          }}
        />
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
                  onClick={() => toggleEditing("mainTitle", true)}
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
                      setTexts((prev) => ({ ...prev, mainTitle: newTitle }));
                      if (newTitle.length > MAX_LENGTHS.mainTitle) {
                        setTitleError(
                          `Le titre ne doit pas dépasser ${MAX_LENGTHS.mainTitle} caractères`
                        );
                      } else {
                        setTitleError("");
                      }
                    }}
                    className={`text-4xl font-bold bg-transparent border-b-2 
                      ${titleError ? "border-red-500" : "border-blue-500"} 
                      focus:outline-none focus:border-blue-700 w-full`}
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      handleTextUpdate("mainTitle", texts.mainTitle);
                      toggleEditing("mainTitle", false);
                    }}
                    className={`px-4 py-2 ${
                      titleError
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    } text-white rounded-lg transition-colors`}
                    disabled={!!titleError}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => toggleEditing("mainTitle", false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>

                {titleError && (
                  <div className="text-red-500 text-sm">{titleError}</div>
                )}

                <div
                  className={`text-sm ${
                    texts.mainTitle.length > MAX_LENGTHS.mainTitle
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                >
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
                  onClick={() => toggleEditing("subtitle", true)}
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
                      setTexts((prev) => ({ ...prev, subtitle: newValue }));
                      if (newValue.length > MAX_LENGTHS.subtitle) {
                        setTitleError(
                          `Le texte ne doit pas dépasser ${MAX_LENGTHS.subtitle} caractères`
                        );
                      } else {
                        setTitleError("");
                      }
                    }}
                    className={`text-xl text-gray-600 dark:text-gray-400 bg-transparent border-b-2 
                      ${titleError ? "border-red-500" : "border-blue-500"} 
                      focus:outline-none focus:border-blue-700 w-full`}
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      handleTextUpdate("subtitle", texts.subtitle);
                      toggleEditing("subtitle", false);
                    }}
                    className={`px-4 py-2 ${
                      titleError
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    } text-white rounded-lg transition-colors`}
                    disabled={!!titleError}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => toggleEditing("subtitle", false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>

                {titleError && (
                  <div className="text-red-500 text-sm">{titleError}</div>
                )}

                <div
                  className={`text-sm ${
                    texts.subtitle.length > MAX_LENGTHS.subtitle
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                >
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
                  <p className="text-lg">{texts.documentumText}</p>
                  <button
                    onClick={() => toggleEditing("documentumText", true)}
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
                        setTexts((prev) => ({
                          ...prev,
                          documentumText: newValue,
                        }));
                        if (newValue.length > MAX_LENGTHS.documentumText) {
                          setTitleError(
                            `Le texte ne doit pas dépasser ${MAX_LENGTHS.documentumText} caractères`
                          );
                        } else {
                          setTitleError("");
                        }
                      }}
                      className={`text-lg bg-transparent border-b-2 
                        ${titleError ? "border-red-500" : "border-blue-500"} 
                        focus:outline-none focus:border-blue-700 w-full`}
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        handleTextUpdate(
                          "documentumText",
                          texts.documentumText
                        );
                        toggleEditing("documentumText", false);
                      }}
                      className={`px-4 py-2 ${
                        titleError
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      } text-white rounded-lg transition-colors`}
                      disabled={!!titleError}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => toggleEditing("documentumText", false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  {titleError && (
                    <div className="text-red-500 text-sm">{titleError}</div>
                  )}

                  <div
                    className={`text-sm ${
                      texts.documentumText.length > MAX_LENGTHS.documentumText
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {texts.documentumText.length}/{MAX_LENGTHS.documentumText}{" "}
                    caractères
                  </div>
                </div>
              ) : (
                <p className="text-lg">{texts.documentumText}</p>
              )}
            </div>
          </section>

          {/* Services Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {cards.map((card) => {
              const IconComponent = Hi2Icons[
                card.icon as keyof typeof Hi2Icons
              ] as IconType;
              return (
                <div
                  key={card.id}
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
                  <p className="text-gray-600 dark:text-gray-400">
                    {card.content}
                  </p>
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
              <h2 className="text-2xl font-bold mb-4">
                Démarrons votre projet
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Contactez-moi pour discuter de vos besoins en gestion
                documentaire.
              </p>
              
              {isLoggedIn && editingStates.contactEmail ? (
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={texts.contactEmail}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setTexts(prev => ({ ...prev, contactEmail: newValue }));
                      if (newValue.length > MAX_LENGTHS.contactEmail) {
                        setTitleError(
                          `L'email ne doit pas dépasser ${MAX_LENGTHS.contactEmail} caractères`
                        );
                      } else {
                        setTitleError("");
                      }
                    }}
                    className={`px-4 py-2 rounded-lg border 
                      ${titleError ? "border-red-500" : "border-gray-300"} 
                      dark:border-gray-600 dark:bg-gray-700 dark:text-white 
                      focus:ring-2 focus:ring-blue-500`}
                    placeholder="Adresse email"
                  />
                  <button
                    onClick={() => {
                      handleTextUpdate("contactEmail", texts.contactEmail);
                      toggleEditing("contactEmail", false);
                    }}
                    className={`p-2 ${
                      titleError
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-green-600 hover:text-green-700"
                    } dark:text-green-500 dark:hover:text-green-400`}
                    disabled={!!titleError}
                    title="Sauvegarder"
                  >
                    <HiOutlineCheck className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => toggleEditing("contactEmail", false)}
                    className="p-2 text-red-600 hover:text-red-700 
                      dark:text-red-500 dark:hover:text-red-400"
                    title="Annuler"
                  >
                    <HiOutlineX className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${texts.contactEmail}`}
                    className="inline-flex items-center gap-2 px-6 py-3 
                      bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                      transition-colors"
                  >
                    <HiOutlineEnvelope className="text-xl" />
                    Me contacter
                  </a>
                  {isLoggedIn && (
                    <button
                    // setEditingStates((prev) => ({ ...prev, [field]: value }));
                      onClick={() => setEditingStates((prev) => ({ ...prev, ["contactEmail"]: true }))}
                      className="p-2 text-gray-600 hover:text-gray-700 
                        dark:text-gray-400 dark:hover:text-gray-300"
                      title="Modifier l'email"
                    >
                      <HiOutlinePencil className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Professional Experience Section */}
      <ExperienceSection
        experiences={experiences}
        isLoggedIn={isLoggedIn}
        onDelete={handleDeleteExperience}
        onAdd={() => setIsAddExperienceModalOpen(true)}
        setExperienceToEdit={setExperienceToEdit}
        setIsEditingExperience={setIsEditingExperience}
      />

      {isAddExperienceModalOpen && (
        <AddExperienceModal
          onClose={() => setIsAddExperienceModalOpen(false)}
          onAdd={handleAddExperience}
        />
      )}

      {isDeleteExperienceModalOpen && (
        <DeleteExperienceConfirmationModal
          onConfirm={handleConfirmDeleteExperience}
          onCancel={() => {
            setIsDeleteExperienceModalOpen(false);
            setExperienceToDelete(null);
          }}
          message="Êtes-vous sûr de vouloir supprimer cette expérience ?"
        />
      )}

      {isEditingExperience && experienceToEdit && (
        <EditExperienceModal
          experience={experienceToEdit}
          onClose={() => {
            setIsEditingExperience(false);
            setExperienceToEdit(null);
          }}
          onSave={handleEditExperience}
        />
      )}

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
