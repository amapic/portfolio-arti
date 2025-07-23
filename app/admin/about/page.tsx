"use client";

import React, { useState, useEffect } from 'react';
import { AboutData } from '../../types/about';
import { Header } from '../../components/Header';
import { LoginModal } from '../../components/modals/LoginModal';
import NoSSR from '../../components/NoSSR';

const AboutAdmin: React.FC = () => {
  // États pour l'authentification
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const [aboutData, setAboutData] = useState<AboutData>({
    id: '',
    projet: '3',
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
    },
    footer: {
      copyrightText: '',
      designBy: '',
      designUrl: '',
      realisationBy: '',
      realisationUrl: '',
      mentionsLegalesUrl: ''
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const IMAGE_API_URL = process.env.NEXT_PUBLIC_IMAGE_API_URL;
  const PROJECT_ID = process.env.NEXT_PUBLIC_ID_PROJET;

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

  // Charger les données quand l'utilisateur est connecté
  useEffect(() => {
    if (isLoggedIn) {
      loadAboutData();
    }
  }, [isLoggedIn]);

  const handleLogin = (success: boolean) => {
    if (success) {
      setIsLoggedIn(true);
      localStorage.setItem('adminLoggedIn', 'true');
      localStorage.setItem('adminLoginTime', Date.now().toString());
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminLoginTime');
    setShowLoginModal(true);
  };

  const loadAboutData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/about?projectId=${PROJECT_ID}`);
      if (response.ok) {
        const data: AboutData = await response.json();
        setAboutData(data);
      } else {
        console.error('Erreur lors du chargement des données');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Veuillez sélectionner une image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("L'image ne doit pas dépasser 5MB");
      return;
    }

    setSelectedImageFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!selectedImageFile) return null;

    try {
      const formData = new FormData();
      formData.append('file', selectedImageFile);
      
      const uploadResponse = await fetch(`${IMAGE_API_URL}?projectId=${PROJECT_ID}`, {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Erreur lors de l\'upload de l\'image');
      }

      const uploadResult = await uploadResponse.json();
      let imageUrl = uploadResult.url || uploadResult.imageUrl;
      if (imageUrl) {
        imageUrl = imageUrl.replace("http://", "https://");
      }

      return imageUrl;
    } catch (error) {
      console.error('Erreur upload image:', error);
      alert('Erreur lors de l\'upload de l\'image');
      return null;
    }
  };

  const handleSave = async () => {
    if (!aboutData) return;

    try {
      setSaving(true);
      
      let finalData = { ...aboutData };

      // Upload nouvelle image si sélectionnée
      if (selectedImageFile) {
        const newImageUrl = await handleImageUpload();
        if (newImageUrl) {
          finalData.image_url = newImageUrl;
        }
      }

      const response = await fetch(`${API_URL}/api/about?projectId=${PROJECT_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(finalData)
      });

      if (response.ok) {
        const updatedData = await response.json();
        setAboutData(updatedData);
        setSelectedImageFile(null);
        setImagePreview('');
        alert('Données sauvegardées avec succès !');
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <NoSSR>
        <div suppressHydrationWarning={true}>
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4">Chargement...</span>
          </div>
        </div>
      </NoSSR>
    );
  }

  if (!isLoggedIn) {
    return (
      <NoSSR>
        <div suppressHydrationWarning={true}>
          {showLoginModal && (
            <LoginModal
              onClose={() => setShowLoginModal(false)}
              onLogin={handleLogin}
            />
          )}
        </div>
      </NoSSR>
    );
  }

  if (!aboutData) {
    return (
      <NoSSR>
        <div suppressHydrationWarning={true}>
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div>Erreur lors du chargement des données</div>
          </div>
        </div>
      </NoSSR>
    );
  }

  return (
    <NoSSR>
      <div suppressHydrationWarning={true} className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Administration - À Propos
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Déconnexion
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Image de portrait
              </label>
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  {(imagePreview || aboutData.image_url) && (
                    <div className="mt-4">
                      <img
                        src={imagePreview || aboutData.image_url}
                        alt="Aperçu"
                        className="max-w-xs h-auto border rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Texte alternatif de l'image */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Texte alternatif de l'image
              </label>
              <input
                type="text"
                value={aboutData.image_alt}
                onChange={(e) => setAboutData(prev => prev ? { ...prev, image_alt: e.target.value } : null)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Texte principal */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Texte principal
              </label>
              <textarea
                value={aboutData.main_text}
                onChange={(e) => setAboutData(prev => prev ? { ...prev, main_text: e.target.value } : null)}
                rows={8}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Citation */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Citation
              </label>
              <textarea
                value={aboutData.quote}
                onChange={(e) => setAboutData(prev => prev ? { ...prev, quote: e.target.value } : null)}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Auteur de la citation */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Auteur de la citation
              </label>
              <input
                type="text"
                value={aboutData.quote_author}
                onChange={(e) => setAboutData(prev => prev ? { ...prev, quote_author: e.target.value } : null)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Liens */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Liens</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Instagram
                  </label>
                  <input
                    type="url"
                    value={aboutData.links.instagram}
                    onChange={(e) => setAboutData(prev => prev ? {
                      ...prev,
                      links: { ...prev.links, instagram: e.target.value }
                    } : null)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Facebook
                  </label>
                  <input
                    type="url"
                    value={aboutData.links.facebook}
                    onChange={(e) => setAboutData(prev => prev ? {
                      ...prev,
                      links: { ...prev.links, facebook: e.target.value }
                    } : null)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={aboutData.links.linkedin}
                    onChange={(e) => setAboutData(prev => prev ? {
                      ...prev,
                      links: { ...prev.links, linkedin: e.target.value }
                    } : null)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Site web 1
                  </label>
                  <input
                    type="url"
                    value={aboutData.links.website1}
                    onChange={(e) => setAboutData(prev => prev ? {
                      ...prev,
                      links: { ...prev.links, website1: e.target.value }
                    } : null)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Site web 2
                  </label>
                  <input
                    type="url"
                    value={aboutData.links.website2}
                    onChange={(e) => setAboutData(prev => prev ? {
                      ...prev,
                      links: { ...prev.links, website2: e.target.value }
                    } : null)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Configuration du Footer */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration du Footer</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="copyrightText" className="block text-sm font-medium text-gray-900 mb-1">
                    Texte de copyright
                  </label>
                  <input
                    id="copyrightText"
                    type="text"
                    value={aboutData.footer?.copyrightText || ''}
                    onChange={(e) => setAboutData(prev => prev ? {
                      ...prev,
                      footer: { ...(prev.footer || {}), copyrightText: e.target.value }
                    } : null)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="© 2025 - Nom - Tous droits réservés"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="designBy" className="block text-sm font-medium text-gray-900 mb-1">
                      Design par
                    </label>
                    <input
                      id="designBy"
                      type="text"
                      value={aboutData.footer?.designBy || ''}
                      onChange={(e) => setAboutData(prev => prev ? {
                        ...prev,
                        footer: { ...(prev.footer || {}), designBy: e.target.value }
                      } : null)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Nom du designer"
                    />
                  </div>

                  <div>
                    <label htmlFor="designUrl" className="block text-sm font-medium text-gray-900 mb-1">
                      Lien design
                    </label>
                    <input
                      id="designUrl"
                      type="url"
                      value={aboutData.footer?.designUrl || ''}
                      onChange={(e) => setAboutData(prev => prev ? {
                        ...prev,
                        footer: { ...(prev.footer || {}), designUrl: e.target.value }
                      } : null)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label htmlFor="realisationBy" className="block text-sm font-medium text-gray-900 mb-1">
                      Réalisation par
                    </label>
                    <input
                      id="realisationBy"
                      type="text"
                      value={aboutData.footer?.realisationBy || ''}
                      onChange={(e) => setAboutData(prev => prev ? {
                        ...prev,
                        footer: { ...(prev.footer || {}), realisationBy: e.target.value }
                      } : null)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Nom du développeur"
                    />
                  </div>

                  <div>
                    <label htmlFor="realisationUrl" className="block text-sm font-medium text-gray-900 mb-1">
                      Lien réalisation
                    </label>
                    <input
                      id="realisationUrl"
                      type="url"
                      value={aboutData.footer?.realisationUrl || ''}
                      onChange={(e) => setAboutData(prev => prev ? {
                        ...prev,
                        footer: { ...(prev.footer || {}), realisationUrl: e.target.value }
                      } : null)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="mentionsLegalesUrl" className="block text-sm font-medium text-gray-900 mb-1">
                    Lien mentions légales
                  </label>
                  <input
                    id="mentionsLegalesUrl"
                    type="url"
                    value={aboutData.footer?.mentionsLegalesUrl || ''}
                    onChange={(e) => setAboutData(prev => prev ? {
                      ...prev,
                      footer: { ...(prev.footer || {}), mentionsLegalesUrl: e.target.value }
                    } : null)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="/mentions-legales"
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
    </NoSSR>
  );
};

export default AboutAdmin;
