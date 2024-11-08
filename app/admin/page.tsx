'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Section } from './../types/section'
import IconSelector from './../components/IconSelector';
import * as Hi from 'react-icons/hi';
import * as Hi2 from 'react-icons/hi2';
import ConfirmationModal from './../components/ConfirmationModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (response.ok) {
      setIsAuthenticated(true)
      setError('')
    } else {
      setError('Mot de passe incorrect')
    }
  }
  // alert(isAuthenticated)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-center text-gray-800">Administration</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-800">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-800"
              />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    )
  }

  return <AdminDashboard />
}

function AdminDashboard() {
  const [sections, setSections] = useState<Section[]>([])
  const [newSection, setNewSection] = useState<Omit<Section, 'id' | 'createdAt' | 'updatedAt'>>({
    title: '',
    content: '',
    type: 'card',
    iconName: ''
  })
  const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    sectionId: string | null;
  }>({
    isOpen: false,
    sectionId: null
  });

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await fetch(`${API_URL}/sections`);
      const data = await response.json();
      setSections(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    console.log(newSection)
    e.preventDefault()
    try {
      const response = await fetch(`${API_URL}/sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSection),
      });

      if (response.ok) {
        setNewSection({ title: '', content: '', type: 'card', iconName: '' });
        fetchSections();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDeleteSection = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/sections/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchSections();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // Fonction pour obtenir le composant icône à partir du nom
  const getIconComponent = (iconName: string) => {
    const allIcons = { ...Hi, ...Hi2 };
    return allIcons[iconName as keyof typeof allIcons];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Dashboard Administration</h1>
        
        {/* Formulaire d'ajout de section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Ajouter une nouvelle section</h2>
          <form onSubmit={handleAddSection} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-800">Titre</label>
              <input
                type="text"
                value={newSection.title}
                onChange={(e) => setNewSection({...newSection, title: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Icône</label>
              <div className="flex items-center gap-3">
                {newSection.iconName && (
                  <div className="p-3 border rounded-lg bg-gray-50">
                    {React.createElement(getIconComponent(newSection.iconName), {
                      className: "h-6 w-6 text-gray-900"
                    })}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setIsIconSelectorOpen(true)}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 font-semibold shadow-sm"
                >
                  <Hi.HiPlus className="h-5 w-5" />
                  {newSection.iconName ? 'Changer l\'icône' : 'Ajouter une icône'}
                </button>
              </div>
              {!newSection.iconName && (
                <p className="mt-2 text-sm text-gray-900 font-medium">
                  Aucune icône sélectionnée
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800">Contenu</label>
              <textarea
                value={newSection.content}
                onChange={(e) => setNewSection({...newSection, content: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800">Type</label>
              <select
                value={newSection.type}
                onChange={(e) => setNewSection({...newSection, type: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-800"
              >
                <option value="card">Carte</option>
                <option value="section">Section</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Ajouter
            </button>
          </form>
        </div>

        {/* Liste des sections existantes */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Sections existantes</h2>
          {sections.length === 0 ? (
            <p className="text-gray-700">Aucune section pour le moment</p>
          ) : (
            <div key="tttt" className="space-y-4">
              {sections.map((section) => (
                <div key={section.id} className="p-4 border rounded-lg bg-white shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        {section.iconName && (
                          <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                            {React.createElement(getIconComponent(section.iconName), {
                              className: "h-6 w-6 text-gray-900"
                            })}
                          </div>
                        )}
                        <h3 className="text-lg font-medium text-gray-900">{section.title}</h3>
                      </div>
                      <p className="text-gray-900 mt-3 whitespace-pre-wrap">{section.content}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {section.type}
                        </span>
                        <span className="text-sm text-gray-900">
                          Créé le {new Date(section.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setDeleteConfirmation({ isOpen: true, sectionId: section.id })}
                      className="ml-4 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de sélection d'icône */}
      <IconSelector
        isOpen={isIconSelectorOpen}
        onClose={() => setIsIconSelectorOpen(false)}
        onSelect={(iconName) => {
          setNewSection({ ...newSection, iconName });
          setIsIconSelectorOpen(false);
        }}
      />

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, sectionId: null })}
        onConfirm={() => {
          if (deleteConfirmation.sectionId) {
            handleDeleteSection(deleteConfirmation.sectionId);
          }
        }}
        title="Supprimer la section"
        message="Êtes-vous sûr de vouloir supprimer cette section ? Cette action est irréversible."
      />
    </div>
  )
} 