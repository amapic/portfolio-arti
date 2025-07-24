"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ImageMeta } from '../../types/imageMeta';
import { HiOutlineCloud, HiOutlineTrash, HiOutlineEye, HiOutlineEyeSlash, HiOutlineFunnel, HiOutlinePencil } from 'react-icons/hi2';
import { HiOutlinePhotograph, HiOutlineX } from 'react-icons/hi';
import NoSSR from '../../components/NoSSR';
import { Header } from '../../components/Header';
import { useAuth } from '../../components/AuthProvider';
import AdminLayout from '../../components/AdminLayout';
import { CATEGORIES, CATEGORY_VALUES, CategoryType, getCategoryLabel, getCategoryColor, imageMatchesCategory, normalizeCategoriesArray, getCategoriesLabels } from '../../types/categories';
import PortfolioFooter from '../../components/PortfolioFooter';
import ImageCropper from '../../components/ImageCropper';

const ImagesAdmin: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { logout } = useAuth();
  
  const [images, setImages] = useState<ImageMeta[]>([]);
  const [filteredImages, setFilteredImages] = useState<ImageMeta[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'All'>('All');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [editingImage, setEditingImage] = useState<ImageMeta | null>(null);
  const [croppingImage, setCroppingImage] = useState<ImageMeta | null>(null);
  const [newImageMeta, setNewImageMeta] = useState({
    category: ['Theater'] as CategoryType[],
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

  // Charger les images au montage et selon les paramètres d'URL
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category') as CategoryType | null;
    if (categoryFromUrl && CATEGORY_VALUES.includes(categoryFromUrl)) {
      setSelectedCategory(categoryFromUrl);
    }
    loadImages();
  }, [searchParams]);

  // Filtrer les images selon la catégorie sélectionnée
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredImages(images);
    } else {
      setFilteredImages(images.filter(img => imageMatchesCategory(img.category, selectedCategory)));
    }
  }, [images, selectedCategory]);

  const loadImages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/images?projectId=${PROJECT_ID}`);
      if (response.ok) {
        const data = await response.json();
        setImages(data);
      } else {
        console.error('Erreur lors du chargement des images');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 10MB');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      
      // Upload de l'image
      const formData = new FormData();
      formData.append('file', selectedFile);
      
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

      // Création des métadonnées
      const metadata = {
        image_url: imageUrl,
        category: newImageMeta.category,
        alt: newImageMeta.alt,
        titre: newImageMeta.titre,
        sousTitre: newImageMeta.sousTitre,
        dimension: newImageMeta.dimension,
        crop: {
          x: 0,
          y: 0,
          size: 100 // Image entière par défaut
        },
        selected: false,
        position: 0
      };

      const metaResponse = await fetch(`${API_URL}/api/images?projectId=${PROJECT_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata)
      });

      if (!metaResponse.ok) {
        throw new Error('Erreur lors de la sauvegarde des métadonnées');
      }

      // Reset du formulaire
      setSelectedFile(null);
      setPreviewUrl('');
      setNewImageMeta({
        category: ['Theater'],
        alt: '',
        titre: '',
        sousTitre: '',
        dimension: [1, 1]
      });

      // Recharger la liste
      loadImages();
      alert('Image uploadée avec succès!');

    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return;

    try {
      const response = await fetch(`${API_URL}/api/images/${id}?projectId=${PROJECT_ID}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadImages();
        alert('Image supprimée avec succès');
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleToggleVisibility = async (image: ImageMeta) => {
    try {
      const updatedImage = { ...image, selected: !image.selected };
      
      const response = await fetch(`${API_URL}/api/images/${image.id}?projectId=${PROJECT_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedImage)
      });

      if (response.ok) {
        // Mettre à jour seulement l'état local sans recharger depuis l'API
        setImages(prevImages => 
          prevImages.map(img => 
            img.id === image.id ? { ...img, selected: !img.selected } : img
          )
        );
      } else {
        alert('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleSaveEdit = async (updatedImage: ImageMeta) => {
    try {
      const response = await fetch(`${API_URL}/api/images/${updatedImage.id}?projectId=${PROJECT_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedImage)
      });

      if (response.ok) {
        setEditingImage(null);
        loadImages();
        alert('Image mise à jour avec succès');
      } else {
        alert('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleCategoryChange = (category: CategoryType | 'All') => {
    setSelectedCategory(category);
    
    const newParams = new URLSearchParams(searchParams.toString());
    if (category === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', category);
    }
    
    const newUrl = `/admin/images${newParams.toString() ? '?' + newParams.toString() : ''}`;
    router.push(newUrl);
  };

  const handleCropChange = (crop: { x: number; y: number; size: number }) => {
    if (croppingImage) {
      setCroppingImage(prev => prev ? { ...prev, crop } : null);
    }
  };

  const handleDimensionChange = (newDimension: [number, number]) => {
    if (croppingImage) {
      setCroppingImage(prev => prev ? { 
        ...prev, 
        dimension: newDimension,
        // Réinitialiser le crop quand on change de dimension
        crop: { x: 0, y: 0, size: 100 }
      } : null);
    }
  };

  const handleSaveCrop = async () => {
    if (!croppingImage) return;

    try {
      const response = await fetch(`${API_URL}/api/images/${croppingImage.id}?projectId=${PROJECT_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(croppingImage)
      });

      if (response.ok) {
        // Mettre à jour l'état local
        setImages(prevImages => 
          prevImages.map(img => 
            img.id === croppingImage.id ? croppingImage : img
          )
        );
        setCroppingImage(null);
        alert('Recadrage sauvegardé avec succès');
      } else {
        alert('Erreur lors de la sauvegarde du recadrage');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde du recadrage');
    }
  };

  if (loading) {
    return (
      <NoSSR>
        <div suppressHydrationWarning={true} className="min-h-screen bg-gray-50">
          <Header />
          
          <AdminLayout>
            <div className="max-w-7xl mx-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Administration - Images
                </h1>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Déconnexion
                </button>
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

  return (
    <NoSSR>
      <div suppressHydrationWarning={true} className="min-h-screen bg-gray-50">
        <Header />
        
        <AdminLayout>
          <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Administration - Images ({filteredImages.length})
              </h1>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Déconnexion
              </button>
            </div>

            {/* Section Upload */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-900">
                <HiOutlineCloud className="mr-2" />
                Ajouter une nouvelle image
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload et aperçu */}
                <div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="imageUpload"
                    />
                    <label htmlFor="imageUpload" className="cursor-pointer">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Aperçu" className="max-h-48 mx-auto rounded" />
                      ) : (
                        <div>
                          <HiOutlinePhotograph className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-600">
                            Cliquez pour sélectionner une image
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Métadonnées */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Catégories
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORY_VALUES.map(cat => (
                        <label key={cat} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newImageMeta.category.includes(cat)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewImageMeta(prev => ({ 
                                  ...prev, 
                                  category: [...prev.category, cat] 
                                }));
                              } else {
                                setNewImageMeta(prev => ({ 
                                  ...prev, 
                                  category: prev.category.filter(c => c !== cat) 
                                }));
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-900">{getCategoryLabel(cat)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Titre
                    </label>
                    <input
                      type="text"
                      value={newImageMeta.titre}
                      onChange={(e) => setNewImageMeta(prev => ({ ...prev, titre: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="Titre de l'image"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Sous-titre
                    </label>
                    <input
                      type="text"
                      value={newImageMeta.sousTitre}
                      onChange={(e) => setNewImageMeta(prev => ({ ...prev, sousTitre: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="Sous-titre de l'image"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Texte alternatif
                    </label>
                    <input
                      type="text"
                      value={newImageMeta.alt}
                      onChange={(e) => setNewImageMeta(prev => ({ ...prev, alt: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="Description pour l'accessibilité"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Dimensions
                    </label>
                    <select
                      value={JSON.stringify(newImageMeta.dimension)}
                      onChange={(e) => setNewImageMeta(prev => ({ ...prev, dimension: JSON.parse(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    >
                      {dimensions.map((dim, index) => (
                        <option key={index} value={JSON.stringify(dim.value)}>
                          {dim.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Upload en cours...' : 'Uploader l\'image'}
                  </button>
                </div>
              </div>
            </div>

            {/* Filtres */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCategoryChange('All')}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedCategory === 'All'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Toutes ({images.length})
                </button>
                {CATEGORY_VALUES.map(category => {
                  console.log(category);
                  const count = images.filter(img => imageMatchesCategory(img.category, category)).length;
                  const colorClass = getCategoryColor(category);
                  return (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedCategory === category
                          ? `${colorClass} text-white`
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {getCategoryLabel(category)} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grille d'images */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredImages.map((image) => (
                <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative">
                    <img
                      src={image.image_url}
                      alt={image.alt}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={() => setCroppingImage(image)}
                        className="p-1 bg-purple-600 text-white rounded-full hover:bg-purple-700"
                        title="Recadrer"
                      >
                        <HiOutlineFunnel className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleVisibility(image)}
                        className={`p-1 rounded-full ${
                          image.selected
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-600 text-white'
                        }`}
                        title={image.selected ? 'Désélectionner' : 'Sélectionner'}
                      >
                        {image.selected ? <HiOutlineEye className="w-4 h-4" /> : <HiOutlineEyeSlash className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(image.id)}
                        className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                        title="Supprimer"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    {editingImage?.id === image.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editingImage.titre}
                          onChange={(e) => setEditingImage(prev => prev ? { ...prev, titre: e.target.value } : null)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Titre"
                        />
                        <input
                          type="text"
                          value={editingImage.sousTitre}
                          onChange={(e) => setEditingImage(prev => prev ? { ...prev, sousTitre: e.target.value } : null)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Sous-titre"
                        />
                        
                        {/* Catégories multiples */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Catégories</label>
                          <div className="grid grid-cols-2 gap-1">
                            {CATEGORY_VALUES.map(cat => (
                              <label key={cat} className="flex items-center space-x-1 text-xs">
                                <input
                                  type="checkbox"
                                  checked={normalizeCategoriesArray(editingImage.category).includes(cat)}
                                  onChange={(e) => {
                                    const currentCategories = normalizeCategoriesArray(editingImage.category);
                                    if (e.target.checked) {
                                      setEditingImage(prev => prev ? { 
                                        ...prev, 
                                        category: [...currentCategories, cat] 
                                      } : null);
                                    } else {
                                      setEditingImage(prev => prev ? { 
                                        ...prev, 
                                        category: currentCategories.filter(c => c !== cat) 
                                      } : null);
                                    }
                                  }}
                                  className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="text-gray-900">{getCategoryLabel(cat)}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleSaveEdit(editingImage)}
                            className="flex-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            Sauvegarder
                          </button>
                          <button
                            onClick={() => setEditingImage(null)}
                            className="flex-1 px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <button
                          onClick={() => setEditingImage(image)}
                          className="absolute top-0 left-0 p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 z-10"
                          title="Modifier les métadonnées"
                        >
                          <HiOutlinePencil className="w-3 h-3" />
                        </button>
                        <div className="ml-6">
                          <h3 className="font-medium text-sm truncate">{image.titre || 'Sans titre'}</h3>
                          <p className="text-xs text-gray-600 truncate">{image.sousTitre || 'Sans sous-titre'}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {image.dimension.join('×')} • {image.selected ? 'Sélectionné' : 'Non sélectionné'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal de recadrage */}
            {croppingImage && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Recadrer l'image - {croppingImage.titre || 'Sans titre'}
                    </h3>
                    <button
                      onClick={() => setCroppingImage(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <HiOutlineX className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <ImageCropper
                    imageUrl={croppingImage.image_url}
                    dimension={croppingImage.dimension}
                    initialCrop={croppingImage.crop}
                    onCropChange={handleCropChange}
                    onDimensionChange={handleDimensionChange}
                  />
                  
                  <div className="flex gap-2 mt-6 pt-4 border-t">
                    <button
                      onClick={handleSaveCrop}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Sauvegarder le recadrage
                    </button>
                    <button
                      onClick={() => setCroppingImage(null)}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </AdminLayout>
        <PortfolioFooter />
      </div>
    </NoSSR>
  );
};

export default ImagesAdmin;
