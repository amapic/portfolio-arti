"use client";

import React, { useState, useEffect } from 'react';
import { TextData } from '../../types/text';
import { Header } from '../../components/Header';
import { useAuth } from '../../components/SimpleAuthProvider';
import AdminLayout from '../../components/AdminLayout';
import NoSSR from '../../components/NoSSR';
import PortfolioFooter from '../../components/PortfolioFooter';
import Link from 'next/link';

const AboutAdmin: React.FC = () => {
  const { logout, user, hasWriteAccess } = useAuth();
  
  const [textData, setTextData] = useState<TextData>({
    id: '',
    projet: '3',
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
  const [originalTextData, setOriginalTextData] = useState<TextData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const IMAGE_API_URL = process.env.NEXT_PUBLIC_IMAGE_API_URL;
  const PROJECT_ID = process.env.NEXT_PUBLIC_ID_PROJET;

  // Fonction pour afficher l'erreur de permissions pour les viewers
  const showViewerError = () => {
    setNotification({
      message: "Modification impossible en mode viewer",
      type: 'error'
    });
    setTimeout(() => setNotification(null), 3000);
  };

  // Charger les données au montage
  useEffect(() => {
    loadTextData();
  }, []);

  const loadTextData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://dev2site.net:4000/api/texts?projectId=${PROJECT_ID}`);
      if (response.ok) {
        const data: TextData = await response.json();
        console.log("Données about API 4000:", data);
        setTextData(data);
        setOriginalTextData(JSON.parse(JSON.stringify(data))); // Deep copy pour comparaison
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
      setNotification({ message: "Veuillez sélectionner une image", type: 'error' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setNotification({ message: "L'image ne doit pas dépasser 5MB", type: 'error' });
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
      setNotification({ message: 'Erreur lors de l\'upload de l\'image', type: 'error' });
      return null;
    }
  };

  const handleSave = async () => {
    if (!hasWriteAccess) {
      showViewerError();
      return;
    }
    
    if (!textData || !originalTextData) return;

    try {
      setSaving(true);
      
      let finalData = { ...textData };

      // Upload nouvelle image si sélectionnée
      if (selectedImageFile) {
        const newImageUrl = await handleImageUpload();
        if (newImageUrl) {
          finalData.about.image_url = newImageUrl;
        }
      }

      // Préparer les champs à sauvegarder
      const allFields = [
        { key: 'about.image_url', current: finalData.about.image_url, original: originalTextData.about.image_url },
        { key: 'about.image_alt', current: finalData.about.image_alt, original: originalTextData.about.image_alt },
        { key: 'about.main_text', current: finalData.about.main_text, original: originalTextData.about.main_text },
        { key: 'about.quote', current: finalData.about.quote, original: originalTextData.about.quote },
        { key: 'about.quote_author', current: finalData.about.quote_author, original: originalTextData.about.quote_author },
        { key: 'about.links.instagram', current: finalData.about.links.instagram, original: originalTextData.about.links.instagram },
        { key: 'about.links.facebook', current: finalData.about.links.facebook, original: originalTextData.about.links.facebook },
        { key: 'about.links.linkedin', current: finalData.about.links.linkedin, original: originalTextData.about.links.linkedin },
        { key: 'about.links.website1', current: finalData.about.links.website1, original: originalTextData.about.links.website1 },
        { key: 'about.links.website2', current: finalData.about.links.website2, original: originalTextData.about.links.website2 }
      ];

      // Filtrer uniquement les champs qui ont changé
      const fieldsToSave = allFields.filter(field => field.current !== field.original);
      
      console.log(`${fieldsToSave.length} champ(s) modifié(s) sur ${allFields.length}:`, fieldsToSave.map(f => f.key));

      if (fieldsToSave.length === 0) {
        setNotification({ message: 'Aucune modification détectée.', type: 'error' });
        setSaving(false);
        return;
      }

      // Sauvegarder uniquement les champs modifiés
      let allSuccess = true;
      for (const field of fieldsToSave) {
        try {
          const response = await fetch(`https://dev2site.net:4000/api/texts?projectId=${PROJECT_ID}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ key: field.key, value: field.current })
          });

          if (!response.ok) {
            console.error(`Erreur pour le champ ${field.key}:`, response.status);
            allSuccess = false;
          } else {
            console.log(`✅ Champ ${field.key} sauvegardé`);
          }
        } catch (error) {
          console.error(`Erreur réseau pour le champ ${field.key}:`, error);
          allSuccess = false;
        }
      }

      if (allSuccess) {
        // Recharger les données depuis l'API pour s'assurer de la cohérence
        await loadTextData();
        setSelectedImageFile(null);
        setImagePreview('');
        setNotification({ message: `${fieldsToSave.length} modification(s) sauvegardée(s) avec succès !`, type: 'success' });
      } else {
        setNotification({ message: 'Certaines données n\'ont pas pu être sauvegardées. Vérifiez la console pour plus de détails.', type: 'error' });
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      setNotification({ message: 'Erreur lors de la sauvegarde', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <NoSSR>
        <div suppressHydrationWarning={true} className="min-h-screen bg-gray-50">
          <Header />
          
          <AdminLayout>
            <div className="max-w-4xl mx-auto p-6">
              <div className="flex justify-between items-center mb-6 mt-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Administration - À propos
                </h1>
              </div>
              {/* Zone blanche pendant le chargement */}
              <div className="bg-white rounded-lg shadow-md p-6 min-h-96">
              </div>
            </div>
          </AdminLayout>
          <PortfolioFooter />
        </div>
      </NoSSR>
    );
  }

  if (!textData) {
    return (
      <NoSSR>
        <div suppressHydrationWarning={true} className="min-h-screen">
          <Header />
          
          <AdminLayout>
            <div className="max-w-4xl mx-auto p-6">
              <div className="flex justify-between items-center mb-6 mt-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Administration - À propos
                </h1>
              </div>
              {/* Message d'erreur */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-red-600">Erreur lors du chargement des données</div>
              </div>
            </div>
          </AdminLayout>
          <PortfolioFooter />
        </div>
      </NoSSR>
    );
  }

  return (
    <NoSSR>
      <div suppressHydrationWarning={true} className="">
        <Header />
          
        {notification && (
          <div
            className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white text-center font-semibold transition-all ${
              notification.type === 'success' ? 'bg-customgreen   ' : 'bg-customred'
            }`}
          >
            {notification.message}
          </div>
        )}
          
        <AdminLayout>
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6 mt-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Administration - À Propos
              </h1>
              {/* <Link href="/admin" className="text-blue-600 hover:text-blue-800">
                ← Retour au dashboard
              </Link> */}
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
                      onChange={hasWriteAccess ? handleImageSelect : undefined}
                      disabled={!hasWriteAccess}
                      className={`w-full p-2 border border-gray-300 rounded-md file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer text-gray-700 placeholder:text-gray-400 ${
                        !hasWriteAccess ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    />
                    {!selectedImageFile && !textData.about.image_url && (
                      <p className="mt-2 text-sm text-gray-800 font-medium">Aucun fichier choisi</p>
                    )}
                    {(imagePreview || textData.about.image_url) && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-800 font-medium mb-2">Aperçu :</p>
                        <img
                          src={imagePreview || textData.about.image_url}
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
                  value={textData.about.image_alt}
                  onChange={(e) => hasWriteAccess && setTextData(prev => ({ ...prev, about: { ...prev.about, image_alt: e.target.value } }))}
                  disabled={!hasWriteAccess}
                  className={`w-full p-2 border border-gray-300 rounded-md text-gray-700 font-medium ${
                    !hasWriteAccess ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              {/* Texte principal */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Texte principal
                </label>
                <textarea
                  value={textData.about.main_text}
                  onChange={(e) => hasWriteAccess && setTextData(prev => ({ ...prev, about: { ...prev.about, main_text: e.target.value } }))}
                  rows={8}
                  disabled={!hasWriteAccess}
                  className={`w-full p-2 border border-gray-300 rounded-md text-gray-700 font-medium ${
                    !hasWriteAccess ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              {/* Citation */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Citation
                </label>
                <textarea
                  value={textData.about.quote}
                  onChange={(e) => hasWriteAccess && setTextData(prev => ({ ...prev, about: { ...prev.about, quote: e.target.value } }))}
                  rows={3}
                  disabled={!hasWriteAccess}
                  className={`w-full p-2 border border-gray-300 rounded-md text-gray-700 font-medium ${
                    !hasWriteAccess ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              {/* Auteur de la citation */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Auteur de la citation
                </label>
                <input
                  type="text"
                  value={textData.about.quote_author}
                  onChange={(e) => hasWriteAccess && setTextData(prev => ({ ...prev, about: { ...prev.about, quote_author: e.target.value } }))}
                  disabled={!hasWriteAccess}
                  className={`w-full p-2 border border-gray-300 rounded-md text-gray-700 font-medium ${
                    !hasWriteAccess ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
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
                      value={textData.about.links.instagram}
                      onChange={(e) => hasWriteAccess && setTextData(prev => ({
                        ...prev,
                        about: {
                          ...prev.about,
                          links: { ...prev.about.links, instagram: e.target.value }
                        }
                      }))}
                      disabled={!hasWriteAccess}
                      className={`w-full p-2 border border-gray-300 rounded-md text-gray-700 font-medium ${
                        !hasWriteAccess ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Facebook
                    </label>
                    <input
                      type="url"
                      value={textData.about.links.facebook}
                      onChange={(e) => hasWriteAccess && setTextData(prev => ({
                        ...prev,
                        about: {
                          ...prev.about,
                          links: { ...prev.about.links, facebook: e.target.value }
                        }
                      }))}
                      disabled={!hasWriteAccess}
                      className={`w-full p-2 border border-gray-300 rounded-md text-gray-700 font-medium ${
                        !hasWriteAccess ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={textData.about.links.linkedin}
                      onChange={(e) => hasWriteAccess && setTextData(prev => ({
                        ...prev,
                        about: {
                          ...prev.about,
                          links: { ...prev.about.links, linkedin: e.target.value }
                        }
                      }))}
                      disabled={!hasWriteAccess}
                      className={`w-full p-2 border border-gray-300 rounded-md text-gray-700 font-medium ${
                        !hasWriteAccess ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Site web 1
                    </label>
                    <input
                      type="url"
                      value={textData.about.links.website1}
                      onChange={(e) => hasWriteAccess && setTextData(prev => ({
                        ...prev,
                        about: {
                          ...prev.about,
                          links: { ...prev.about.links, website1: e.target.value }
                        }
                      }))}
                      disabled={!hasWriteAccess}
                      className={`w-full p-2 border border-gray-300 rounded-md text-gray-700 font-medium ${
                        !hasWriteAccess ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Site web 2
                    </label>
                    <input
                      type="url"
                      value={textData.about.links.website2}
                      onChange={(e) => hasWriteAccess && setTextData(prev => ({
                        ...prev,
                        about: {
                          ...prev.about,
                          links: { ...prev.about.links, website2: e.target.value }
                        }
                      }))}
                      disabled={!hasWriteAccess}
                      className={`w-full p-2 border border-gray-300 rounded-md text-gray-700 font-medium ${
                        !hasWriteAccess ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Bouton de sauvegarde */}
              <div className="flex justify-end pt-6 border-t">
                <button
                  onClick={() => hasWriteAccess ? handleSave() : showViewerError()}
                  disabled={saving || !hasWriteAccess}
                  className={`px-6 py-2 rounded-md transition-colors ${
                    hasWriteAccess 
                      ? 'bg-customblue text-white hover:bg-custombluedark disabled:opacity-50 disabled:cursor-not-allowed' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </div>
          </div>
        </AdminLayout>
        <PortfolioFooter />
      </div>
    </NoSSR>
  );
};

export default AboutAdmin;
