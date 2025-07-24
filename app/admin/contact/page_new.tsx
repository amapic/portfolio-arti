"use client";

import React, { useState, useEffect } from 'react';
import { TextData } from '../../types/text';
import { Header } from '../../components/Header';
import { useAuth } from '../../components/AuthProvider';
import AdminLayout from '../../components/AdminLayout';
import NoSSR from '../../components/NoSSR';

const ContactAdmin: React.FC = () => {
  const { logout } = useAuth();
  
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

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const IMAGE_API_URL = process.env.NEXT_PUBLIC_IMAGE_API_URL;
  const PROJECT_ID = process.env.NEXT_PUBLIC_ID_PROJET;

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
        console.log("get text", data);
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
    if (!textData || !originalTextData) return;

    try {
      setSaving(true);
      
      let finalData = { ...textData };

      // Upload nouvelle image si sélectionnée
      if (selectedImageFile) {
        const newImageUrl = await handleImageUpload();
        if (newImageUrl) {
          finalData.contact.image_url = newImageUrl;
        }
      }

      // Préparer les champs à sauvegarder
      const allFields = [
        { key: 'contact.image_url', current: finalData.contact.image_url, original: originalTextData.contact.image_url },
        { key: 'contact.image_alt', current: finalData.contact.image_alt, original: originalTextData.contact.image_alt },
        { key: 'contact.name', current: finalData.contact.name, original: originalTextData.contact.name },
        { key: 'contact.email', current: finalData.contact.email, original: originalTextData.contact.email },
        { key: 'contact.phone', current: finalData.contact.phone, original: originalTextData.contact.phone },
        { key: 'contact.address', current: finalData.contact.address, original: originalTextData.contact.address },
        { key: 'contact.city', current: finalData.contact.city, original: originalTextData.contact.city },
        { key: 'contact.country', current: finalData.contact.country, original: originalTextData.contact.country }
      ];

      // Filtrer uniquement les champs qui ont changé
      const fieldsToSave = allFields.filter(field => field.current !== field.original);
      
      console.log(`${fieldsToSave.length} champ(s) modifié(s) sur ${allFields.length}:`, fieldsToSave.map(f => f.key));

      if (fieldsToSave.length === 0) {
        alert('Aucune modification détectée.');
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
        alert(`${fieldsToSave.length} modification(s) sauvegardée(s) avec succès !`);
      } else {
        alert('Certaines données n\'ont pas pu être sauvegardées. Vérifiez la console pour plus de détails.');
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

  if (!textData) {
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
        
        <AdminLayout>
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Administration - Contact
              </h1>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Déconnexion
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Image de contact
                </label>
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="w-full p-2 border border-gray-300 rounded-md file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer text-gray-700 placeholder:text-gray-400"
                    />
                    {!selectedImageFile && !textData.contact.image_url && (
                      <p className="mt-2 text-sm text-gray-800 font-medium">Aucun fichier choisi</p>
                    )}
                    {(imagePreview || textData.contact.image_url) && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-800 font-medium mb-2">Aperçu :</p>
                        <img
                          src={imagePreview || textData.contact.image_url}
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
                  value={textData.contact.image_alt}
                  onChange={(e) => setTextData(prev => ({ ...prev, contact: { ...prev.contact, image_alt: e.target.value } }))}
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-700 font-medium"
                  placeholder="Description de l'image pour l'accessibilité"
                />
              </div>

              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={textData.contact.name}
                  onChange={(e) => setTextData(prev => ({ ...prev, contact: { ...prev.contact, name: e.target.value } }))}
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-700 font-medium"
                  placeholder="Nom et prénom"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Adresse email
                </label>
                <input
                  type="email"
                  value={textData.contact.email}
                  onChange={(e) => setTextData(prev => ({ ...prev, contact: { ...prev.contact, email: e.target.value } }))}
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-700 font-medium"
                  placeholder="exemple@email.com"
                />
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  value={textData.contact.phone}
                  onChange={(e) => setTextData(prev => ({ ...prev, contact: { ...prev.contact, phone: e.target.value } }))}
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-700 font-medium"
                  placeholder="+33 1 23 45 67 89"
                />
              </div>

              {/* Adresse */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Adresse
                </label>
                <input
                  type="text"
                  value={textData.contact.address}
                  onChange={(e) => setTextData(prev => ({ ...prev, contact: { ...prev.contact, address: e.target.value } }))}
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-700 font-medium"
                  placeholder="123 Rue de la Paix"
                />
              </div>

              {/* Ville et Pays */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={textData.contact.city}
                    onChange={(e) => setTextData(prev => ({ ...prev, contact: { ...prev.contact, city: e.target.value } }))}
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-700 font-medium"
                    placeholder="Paris"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Pays
                  </label>
                  <input
                    type="text"
                    value={textData.contact.country}
                    onChange={(e) => setTextData(prev => ({ ...prev, contact: { ...prev.contact, country: e.target.value } }))}
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-700 font-medium"
                    placeholder="France"
                  />
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
        </AdminLayout>
      </div>
    </NoSSR>
  );
};

export default ContactAdmin;
