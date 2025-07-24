"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ImageMeta } from '../../types/imageMeta';
import { HiOutlineCloud, HiOutlineTrash, HiOutlineEye, HiOutlineEyeSlash, HiOutlineFunnel } from 'react-icons/hi2';
import { HiOutlinePhotograph, HiOutlineX } from 'react-icons/hi';
import NoSSR from '../../components/NoSSR';
import { Header } from '../../components/Header';
import { LoginModal } from '../../components/modals/LoginModal';
import { CATEGORIES, CategoryType, getCategoryLabel, getCategoryColor } from '../../types/categories';

const ImagesAdmin: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // États pour l'authentification
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const [images, setImages] = useState<ImageMeta[]>([]);
  const [filteredImages, setFilteredImages] = useState<ImageMeta[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'All'>('All');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [editingImage, setEditingImage] = useState<ImageMeta | null>(null);
  const [newImageMeta, setNewImageMeta] = useState({
    category: 'Theater' as CategoryType,
    alt: '',
    titre: '',
    sousTitre: '',
    dimension: [1, 1] as [number, number]
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const IMAGE_API_URL = process.env.NEXT_PUBLIC_IMAGE_API_URL;
  const PROJECT_ID = process.env.NEXT_PUBLIC_ID_PROJET;

  const dimensions = [
    { label: '1x1 (Carré)', value: [1, 1] },
    { label: '2x1 (Rectangle horizontal)', value: [2, 1] },
    { label: '1x2 (Rectangle vertical)', value: [1, 2] }
  ];

  // Vérifier l'état de connexion au chargement
  useEffect(() => {
    const checkAuthStatus = () => {
      const authStatus = localStorage.getItem('adminLoggedIn');
      const authTimestamp = localStorage.getItem('adminLoginTime');
      
      if (authStatus === 'true' && authTimestamp) {
        const loginTime = parseInt(authTimestamp);
        const currentTime = Date.now();
        const hoursPassed = (currentTime - loginTime) / (1000 * 60 * 60);
        
        // Session expire après 24 heures
        if (hoursPassed < 24) {
          setIsLoggedIn(true);
          // Les images seront chargées par l'useEffect suivant
        } else {
          // Session expirée
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

  // Charger les images quand l'utilisateur est connecté
  useEffect(() => {
    if (isLoggedIn) {
      loadImages();
    }
  }, [isLoggedIn]);

  // Gestionnaires de connexion
  const handleLogin = (success: boolean) => {
    if (success) {
      setIsLoggedIn(true);
      localStorage.setItem('adminLoggedIn', 'true');
      localStorage.setItem('adminLoginTime', Date.now().toString());
      // Les images seront chargées automatiquement par l'useEffect qui écoute isLoggedIn
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminLoginTime');
    setShowLoginModal(true);
  };

  // Gérer les paramètres d'URL pour le filtre de catégorie
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && (categoryParam === 'All' || CATEGORIES.some(cat => cat.value === categoryParam))) {
      setSelectedCategory(categoryParam as CategoryType | 'All');
      if (images.length > 0) {
        filterImages(images, categoryParam as CategoryType | 'All');
      }
    }
  }, [searchParams, images]);

  const loadImages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/images?projectId=${PROJECT_ID}`);
      if (response.ok) {
        const data: ImageMeta[] = await response.json();
        const sortedImages = data.sort((a, b) => a.position - b.position);
        setImages(sortedImages);
        filterImages(sortedImages, selectedCategory);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des images:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction de filtrage
  const filterImages = (imagesToFilter: ImageMeta[], category: CategoryType | 'All') => {
    if (category === 'All') {
      setFilteredImages(imagesToFilter);
    } else {
      setFilteredImages(imagesToFilter.filter(img => img.category === category));
    }
  };

  // Gérer le changement de filtre
  const handleCategoryFilter = (category: CategoryType | 'All') => {
    setSelectedCategory(category);
    filterImages(images, category);
    
    // Mettre à jour l'URL avec le paramètre de catégorie
    const params = new URLSearchParams(searchParams.toString());
    if (category === 'All') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    
    const newUrl = params.toString() ? `?${params.toString()}` : '/admin/images';
    router.replace(newUrl);
  };

  // Gestion de la sélection de fichier avec validation (inspiré des modals d'expérience)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérification du type et de la taille (comme dans AddExperienceModal)
    if (!file.type.startsWith("image/")) {
      alert("Veuillez sélectionner une image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB max
      alert("L'image ne doit pas dépasser 5MB");
      return;
    }

    setSelectedFile(file);
    
    // Créer l'aperçu
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Supprimer l'aperçu et le fichier sélectionné
  const clearFileSelection = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setNewImageMeta({ category: 'Theater', alt: '', titre: '', sousTitre: '', dimension: [1, 1] });
  };

  // Upload d'une nouvelle image (inspiré de la logique des modals d'expérience)
  const handleImageUpload = async () => {
    if (!selectedFile) {
      alert("Veuillez sélectionner une image");
      return;
    }

    try {
      setUploading(true);
      
      // 1. Upload de l'image via l'API existante (comme dans AddExperienceModal)
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      console.log("IMAGE_API_URL", IMAGE_API_URL);
      const uploadResponse = await fetch(`${IMAGE_API_URL}?projectId=${PROJECT_ID}`, {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Erreur lors de l\'upload de l\'image');
      }

      const uploadResult = await uploadResponse.json();
      console.log("Upload result:", uploadResult);
      
      // Traitement de l'URL (comme dans les modals, avec gestion des protocoles)
      let imageUrl = uploadResult.url || uploadResult.imageUrl;
      if (imageUrl) {
        imageUrl = imageUrl.replace("http://", "https://");
      }

      // 2. Créer les métadonnées via la nouvelle API
      const newImage: Omit<ImageMeta, 'id'> = {
        projet: PROJECT_ID || '1',
        image_url: imageUrl,
        position: images.length,
        selected: false,
        category: newImageMeta.category,
        alt: newImageMeta.alt || `Image ${newImageMeta.category}`,
        titre: newImageMeta.titre || `Titre ${newImageMeta.category}`,
        sousTitre: newImageMeta.sousTitre || '',
        dimension: newImageMeta.dimension
      };

      const metaResponse = await fetch(`${API_URL}/api/images?projectId=${PROJECT_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newImage)
      });

      if (!metaResponse.ok) {
        throw new Error('Erreur lors de la création des métadonnées');
      }

      // Recharger la liste
      await loadImages();
      
      // Reset du formulaire (comme dans les modals)
      clearFileSelection();
      
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
    }
  };

  // Toggle sélection d'une image
  const toggleImageSelection = async (imageId: string) => {
    try {
      const image = images.find(img => img.id === imageId);
      if (!image) return;

      const updatedImage = { ...image, selected: !image.selected };
      
      const response = await fetch(`${API_URL}/api/images/${imageId}?projectId=${PROJECT_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedImage)
      });

      if (response.ok) {
        // Mettre à jour images
        const updatedImages = images.map(img => 
          img.id === imageId ? updatedImage : img
        );
        setImages(updatedImages);
        
        // Mettre à jour aussi filteredImages pour la réactivité de l'affichage
        filterImages(updatedImages, selectedCategory);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  // Supprimer une image
  const deleteImage = async (imageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return;

    try {
      const response = await fetch(`${API_URL}/api/images/${imageId}?projectId=${PROJECT_ID}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const updatedImages = images.filter(img => img.id !== imageId);
        setImages(updatedImages);
        filterImages(updatedImages, selectedCategory);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  // Fonction pour éditer une image
  const startEditImage = (image: ImageMeta) => {
    console.log('Début édition image:', image); // Debug
    setEditingImage(image); // Simplement copier l'image telle quelle
  };

  const cancelEditImage = () => {
    setEditingImage(null);
  };

  const saveEditImage = async () => {
    if (!editingImage) return;

    try {
      console.log('Sauvegarde image:', editingImage); // Debug
      
      // Ajouter la date de mise à jour
      const imageToSave = {
        ...editingImage,
        updated_at: new Date().toISOString()
      };
      
      const response = await fetch(`${API_URL}/api/images/${editingImage.id}?projectId=${PROJECT_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(imageToSave)
      });

      if (response.ok) {
        const updatedImages = images.map(img => 
          img.id === editingImage.id ? imageToSave : img
        ).sort((a, b) => a.position - b.position);
        
        setImages(updatedImages);
        filterImages(updatedImages, selectedCategory);
        setEditingImage(null);
        console.log('Image sauvegardée avec succès'); // Debug
      } else {
        console.error('Erreur réponse serveur:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  return (
    <NoSSR>
      <div suppressHydrationWarning={true}>
        {/* Modal de connexion */}
        {showLoginModal && (
          <LoginModal
            onClose={() => setShowLoginModal(false)}
            onLogin={handleLogin}
          />
        )}

        {/* Contenu de la page admin (affiché seulement si connecté) */}
        {isLoggedIn && (
          <>
            <Header />
            <div className="min-h-screen bg-gray-50 p-8 pt-20">
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900">Administration des Images</h1>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Se déconnecter
                  </button>
                </div>

            {/* Section Upload - Inspirée des modals d'expérience */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Ajouter une nouvelle image</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                {/* Zone d'upload avec aperçu */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Image
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="relative w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg 
                      flex items-center justify-center overflow-hidden hover:border-gray-400 transition-colors">
                      {previewUrl ? (
                        <>
                          <img
                            src={previewUrl}
                            alt="Aperçu"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={clearFileSelection}
                            className="absolute top-1 right-1 p-1 bg-red-500 rounded-full 
                              text-white hover:bg-red-600 transition-colors"
                          >
                            <HiOutlineX className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <label className="cursor-pointer w-full h-full flex items-center justify-center">
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileSelect}
                            disabled={uploading}
                          />
                          {uploading ? (
                            <div className="animate-pulse text-gray-500">Upload...</div>
                          ) : (
                            <HiOutlinePhotograph className="w-8 h-8 text-gray-400" />
                          )}
                        </label>
                      )}
                    </div>
                    <div className="flex-1 text-sm text-gray-500">
                      Format: PNG, JPG, GIF
                      <br />
                      Taille max: 5MB
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Catégorie
                  </label>
                  <select
                    value={newImageMeta.category}
                    onChange={(e) => setNewImageMeta(prev => ({ ...prev, category: e.target.value as CategoryType }))}
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value} className="text-gray-900 dark:text-white">{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Dimension
                  </label>
                  <select
                    value={JSON.stringify(newImageMeta.dimension)}
                    onChange={(e) => setNewImageMeta(prev => ({ 
                      ...prev, 
                      dimension: JSON.parse(e.target.value) 
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                  >
                    {dimensions.map(dim => (
                      <option key={dim.label} value={JSON.stringify(dim.value)} className="text-gray-900 dark:text-white">
                        {dim.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Texte alternatif
                  </label>
                  <input
                    type="text"
                    value={newImageMeta.alt}
                    onChange={(e) => setNewImageMeta(prev => ({ ...prev, alt: e.target.value }))}
                    placeholder="Description de l'image"
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={newImageMeta.titre}
                    onChange={(e) => setNewImageMeta(prev => ({ ...prev, titre: e.target.value }))}
                    placeholder="Titre de l'image"
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Sous-titre
                  </label>
                  <input
                    type="text"
                    value={newImageMeta.sousTitre}
                    onChange={(e) => setNewImageMeta(prev => ({ ...prev, sousTitre: e.target.value }))}
                    placeholder="Sous-titre de l'image"
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>

              <button
                onClick={handleImageUpload}
                disabled={!selectedFile || uploading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiOutlineCloud className="w-5 h-5" />
                {uploading ? 'Upload en cours...' : 'Uploader l\'image'}
              </button>
            </div>

        {/* Liste des images */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Images existantes ({filteredImages.filter(img => img.selected).length} sélectionnées / {filteredImages.length} affichées / {images.length} total)
            </h2>
            
            {/* Filtres */}
            <div className="flex items-center gap-2">
              <HiOutlineFunnel className="w-5 h-5 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryFilter(e.target.value as CategoryType | 'All')}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All" className="text-gray-900 dark:text-white">Toutes les catégories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value} className="text-gray-900 dark:text-white">{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className={`border-2 rounded-lg p-4 ${
                    image.selected ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="aspect-square mb-3 overflow-hidden rounded-md bg-gray-100">
                    <img
                      src={image.image_url}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-2">
                    {editingImage?.id === image.id ? (
                      // Mode édition
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-900 dark:text-white mb-1">Position</label>
                          <input
                            type="number"
                            min="0"
                            value={editingImage.position}
                            onChange={(e) => setEditingImage({
                              ...editingImage,
                              position: parseInt(e.target.value) || 0
                            })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-900 dark:text-white mb-1">Catégorie</label>
                          <select
                            value={editingImage.category}
                            onChange={(e) => setEditingImage({
                              ...editingImage,
                              category: e.target.value as CategoryType
                            })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600"
                          >
                            {CATEGORIES.map(cat => (
                              <option key={cat.value} value={cat.value} className="text-gray-900 dark:text-white">{cat.label}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-900 dark:text-white mb-1">Texte alternatif</label>
                          <textarea
                            value={editingImage.alt}
                            onChange={(e) => setEditingImage({
                              ...editingImage,
                              alt: e.target.value
                            })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400"
                            rows={2}
                            placeholder="Description de l'image..."
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-900 dark:text-white mb-1">Titre</label>
                          <input
                            type="text"
                            value={editingImage.titre}
                            onChange={(e) => setEditingImage({
                              ...editingImage,
                              titre: e.target.value
                            })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400"
                            placeholder="Titre de l'image..."
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-900 dark:text-white mb-1">Sous-titre</label>
                          <input
                            type="text"
                            value={editingImage.sousTitre}
                            onChange={(e) => setEditingImage({
                              ...editingImage,
                              sousTitre: e.target.value
                            })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400"
                            placeholder="Sous-titre de l'image..."
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={saveEditImage}
                            className="flex-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Sauvegarder
                          </button>
                          <button
                            onClick={cancelEditImage}
                            className="flex-1 px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Mode affichage normal
                      <>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(image.category as CategoryType)}`}>
                            {getCategoryLabel(image.category as CategoryType)}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            Position: {image.position}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2">{image.alt}</p>

                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => startEditImage(image)}
                            className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                          >
                            Éditer
                          </button>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleImageSelection(image.id)}
                              className={`p-2 rounded transition-colors ${
                                image.selected 
                                  ? 'text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100' 
                                  : 'text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100'
                              }`}
                              title={image.selected ? 'Masquer cette image' : 'Afficher cette image'}
                            >
                              {image.selected ? <HiOutlineEye className="w-5 h-5" /> : <HiOutlineEyeSlash className="w-5 h-5" />}
                            </button>
                            
                            <button
                              onClick={() => deleteImage(image.id)}
                              className="p-2 text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors"
                              title="Supprimer cette image"
                            >
                              <HiOutlineTrash className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
            </div>
          </>
        )}
      </div>
    </NoSSR>
  );
};

export default ImagesAdmin;
