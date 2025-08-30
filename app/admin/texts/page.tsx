"use client";

import React, { useState, useEffect } from 'react';
import { TextData } from '../../types/text';
import BarbaWrapper from '../../components/BarbaWrapper';
import BarbaLink from '../../components/BarbaLink';

// Composant NoSSR pour éviter l'erreur d'hydratation
const NoSSR: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
};

const TextAdmin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const PROJECT_ID = process.env.NEXT_PUBLIC_ID_PROJET;

  const [textData, setTextData] = useState<TextData>({
    projet: PROJECT_ID || '3',
    contact: {
      email: '',
      phone: '',
      address: '',
      name: '',
      city: '',
      country: '',
      image_url: '',
      image_alt: ''
    },
    about: {
      image_url: '',
      image_alt: '',
      main_text: '',
      quote: '',
      quote_author: '',
      links: {
        instagram: '',
        facebook: '',
        linkedin: '',
        website1: '',
        website2: ''
      }
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  // Vérifier l'authentification
  useEffect(() => {
    const checkAuth = () => {
      const authData = localStorage.getItem('adminAuth');
      if (authData) {
        const { isLoggedIn, timestamp } = JSON.parse(authData);
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        
        if (isLoggedIn && (now - timestamp < oneHour)) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('adminAuth');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Charger les données existantes
  useEffect(() => {
    if (isAuthenticated) {
      const loadTextData = async () => {
        try {
          const response = await fetch(`${API_URL}/api/texts?projectId=${PROJECT_ID}`);
          if (response.ok) {
            const data = await response.json();
            setTextData(data);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des données:', error);
        }
      };

      loadTextData();
    }
  }, [isAuthenticated, API_URL, PROJECT_ID]);

  const handleLogin = () => {
    const password = prompt('Mot de passe admin:');
    if (password === 'admin123') {
      const authData = {
        isLoggedIn: true,
        timestamp: Date.now()
      };
      localStorage.setItem('adminAuth', JSON.stringify(authData));
      setIsAuthenticated(true);
    } else {
      setNotification({ message: 'Mot de passe incorrect', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${API_URL}/api/texts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: PROJECT_ID,
          data: {
            ...textData,
            updated_at: new Date().toISOString()
          }
        }),
      });

      if (response.ok) {
        setNotification({ message: 'Données sauvegardées avec succès !', type: 'success' });
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification({ message: 'Erreur lors de la sauvegarde', type: 'error' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setNotification({ message: 'Erreur lors de la sauvegarde', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Administration - Textes</h1>
          <p className="text-gray-600 mb-6">Connectez-vous pour accéder à l'administration.</p>
          <button
            onClick={handleLogin}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <BarbaWrapper namespace="admin-texts">
      <div className="min-h-screen bg-gray-50 py-8">
        {notification && (
          <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white text-center font-semibold transition-all ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {notification.message}
          </div>
        )}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Administration - Textes (Contact & À propos)</h1>
              <BarbaLink href="/admin" className="text-blue-600 hover:text-blue-800">
                ← Retour au dashboard
              </BarbaLink>
            </div>

            <div className="p-6 space-y-8">
              
              {/* Section Contact */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de Contact</h3>
                
                {/* Image de contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      URL de l'image de contact
                    </label>
                    <input
                      type="url"
                      value={textData.contact.image_url}
                      onChange={(e) => setTextData(prev => ({
                        ...prev,
                        contact: { ...prev.contact, image_url: e.target.value }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="/images/contact.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Texte alternatif de l'image
                    </label>
                    <input
                      type="text"
                      value={textData.contact.image_alt}
                      onChange={(e) => setTextData(prev => ({
                        ...prev,
                        contact: { ...prev.contact, image_alt: e.target.value }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Description de l'image de contact"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={textData.contact.name}
                      onChange={(e) => setTextData(prev => ({
                        ...prev,
                        contact: { ...prev.contact, name: e.target.value }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={textData.contact.email}
                      onChange={(e) => setTextData(prev => ({
                        ...prev,
                        contact: { ...prev.contact, email: e.target.value }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={textData.contact.phone}
                      onChange={(e) => setTextData(prev => ({
                        ...prev,
                        contact: { ...prev.contact, phone: e.target.value }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Adresse
                    </label>
                    <input
                      type="text"
                      value={textData.contact.address}
                      onChange={(e) => setTextData(prev => ({
                        ...prev,
                        contact: { ...prev.contact, address: e.target.value }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Ville
                    </label>
                    <input
                      type="text"
                      value={textData.contact.city}
                      onChange={(e) => setTextData(prev => ({
                        ...prev,
                        contact: { ...prev.contact, city: e.target.value }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Pays
                    </label>
                    <input
                      type="text"
                      value={textData.contact.country}
                      onChange={(e) => setTextData(prev => ({
                        ...prev,
                        contact: { ...prev.contact, country: e.target.value }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>

              {/* Section À propos */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Page À propos</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        URL de l'image
                      </label>
                      <input
                        type="url"
                        value={textData.about.image_url}
                        onChange={(e) => setTextData(prev => ({
                          ...prev,
                          about: { ...prev.about, image_url: e.target.value }
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Texte alternatif de l'image
                      </label>
                      <input
                        type="text"
                        value={textData.about.image_alt}
                        onChange={(e) => setTextData(prev => ({
                          ...prev,
                          about: { ...prev.about, image_alt: e.target.value }
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Texte principal
                    </label>
                    <textarea
                      rows={8}
                      value={textData.about.main_text}
                      onChange={(e) => setTextData(prev => ({
                        ...prev,
                        about: { ...prev.about, main_text: e.target.value }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Citation
                      </label>
                      <textarea
                        rows={3}
                        value={textData.about.quote}
                        onChange={(e) => setTextData(prev => ({
                          ...prev,
                          about: { ...prev.about, quote: e.target.value }
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Auteur de la citation
                      </label>
                      <input
                        type="text"
                        value={textData.about.quote_author}
                        onChange={(e) => setTextData(prev => ({
                          ...prev,
                          about: { ...prev.about, quote_author: e.target.value }
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Liens */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Liens</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Instagram
                    </label>
                    <input
                      type="url"
                      value={textData.about.links.instagram}
                      onChange={(e) => setTextData(prev => ({
                        ...prev,
                        about: {
                          ...prev.about,
                          links: { ...prev.about.links, instagram: e.target.value }
                        }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Facebook
                    </label>
                    <input
                      type="url"
                      value={textData.about.links.facebook}
                      onChange={(e) => setTextData(prev => ({
                        ...prev,
                        about: {
                          ...prev.about,
                          links: { ...prev.about.links, facebook: e.target.value }
                        }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={textData.about.links.linkedin}
                      onChange={(e) => setTextData(prev => ({
                        ...prev,
                        about: {
                          ...prev.about,
                          links: { ...prev.about.links, linkedin: e.target.value }
                        }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Site web 1
                    </label>
                    <input
                      type="url"
                      value={textData.about.links.website1}
                      onChange={(e) => setTextData(prev => ({
                        ...prev,
                        about: {
                          ...prev.about,
                          links: { ...prev.about.links, website1: e.target.value }
                        }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Site web 2
                    </label>
                    <input
                      type="url"
                      value={textData.about.links.website2}
                      onChange={(e) => setTextData(prev => ({
                        ...prev,
                        about: {
                          ...prev.about,
                          links: { ...prev.about.links, website2: e.target.value }
                        }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>

              {/* Bouton de sauvegarde */}
              <div className="flex justify-end pt-6 border-t">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BarbaWrapper>
  );
};

export default TextAdmin;
