"use client";

// Calcule le crop maximal centré pour un ratio donné et des dimensions d'image
function getCenteredMaxCrop(
  imageWidth: number,
  imageHeight: number,
  ratio: [number, number]
) {
  const [rw, rh] = ratio;
  const cropAspect = rw / rh;
  let cropW = imageWidth;
  let cropH = imageHeight;
  if (imageWidth / imageHeight > cropAspect) {
    // Image plus large que le ratio : hauteur limite
    cropH = imageHeight;
    cropW = cropH * cropAspect;
  } else {
    // Image plus haute (ou égale) que le ratio : largeur limite
    cropW = imageWidth;
    cropH = cropW / cropAspect;
  }
  // Position centrée
  const x = ((imageWidth - cropW) / 2 / imageWidth) * 100;
  const y = ((imageHeight - cropH) / 2 / imageHeight) * 100;
  // Taille en pourcentage du max possible
  const size = 100;
  return { x, y, size };
}

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ImageMeta } from "../../types/imageMeta";
import {
  HiOutlineCloud,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineFunnel,
  HiOutlinePencil,
} from "react-icons/hi2";
import { HiOutlinePhotograph, HiOutlineX } from "react-icons/hi";
import NoSSR from "../../components/NoSSR";
import { Header } from "../../components/Header";
import { useAuth } from "../../components/SimpleAuthProvider";
import AdminLayout from "../../components/AdminLayout";
// Types pour les catégories (maintenant chargées dynamiquement)
interface Category {
  id: string;
  value: string;
  label: string;
  order: number;
  isActive: boolean;
}
import PortfolioFooter from "../../components/PortfolioFooter";
import ImageCropper from "../../components/ImageCropper";
import Link from 'next/link';

const ImagesAdmin: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { logout, user, hasWriteAccess } = useAuth();

  const [images, setImages] = useState<ImageMeta[]>([]);
  const [filteredImages, setFilteredImages] = useState<ImageMeta[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [editingImage, setEditingImage] = useState<ImageMeta | null>(null);
  const [croppingImage, setCroppingImage] = useState<ImageMeta | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [newImageMeta, setNewImageMeta] = useState({
    category: [] as string[],
    alt: "",
    titre: "",
    sousTitre: "",
    dimension: [1, 1] as [number, number],
    position: 0,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const IMAGE_API_URL = process.env.NEXT_PUBLIC_IMAGE_API_URL;
  const PROJECT_ID = process.env.NEXT_PUBLIC_ID_PROJET;

  // Fonction pour afficher l'erreur de permissions pour les viewers
  const showViewerError = () => {
    setNotification({
      message: "Modification impossible en mode viewer",
      type: "error"
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const dimensions = [
    { label: "1x1 (Carré)", value: [1, 1] },
    { label: "2x1 (Rectangle horizontal)", value: [2, 1] },
    { label: "1x2 (Rectangle vertical)", value: [1, 2] },
  ];

  // Fonctions utilitaires pour les catégories
  const getCategoryLabel = (value: string): string => {
    const category = categories.find((cat) => cat.value === value);
    return category ? category.label : value;
  };

  const getCategoryColor = (value: string): string => {
    // Couleur par défaut, peut être étendue plus tard
    return "bg-gray-100 text-gray-800";
  };

  const normalizeCategoriesArray = (
    categories: string | string[]
  ): string[] => {
    return Array.isArray(categories) ? categories : [categories];
  };

  const imageMatchesCategory = (
    imageCategory: string | string[],
    filterCategory: string
  ): boolean => {
    if (filterCategory === "All") return true;
    const imageCategoriesArray = normalizeCategoriesArray(imageCategory);
    return imageCategoriesArray.includes(filterCategory);
  };

  const isValidCategory = (categoryValue: string): boolean => {
    return categories.some(
      (cat) => cat.value === categoryValue && cat.isActive
    );
  };

  // Charger les catégories depuis l'API
  const loadCategories = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/categories?projectId=${PROJECT_ID}`
      );
      if (response.ok) {
        const data = await response.json();
        setCategories(
          data.sort((a: Category, b: Category) => a.order - b.order)
        );
      } else {
        console.error("Erreur lors du chargement des catégories");
        // Fallback : catégories par défaut si l'API échoue
        setCategories([]);
      }
    } catch (error) {
      console.error("Erreur de connexion à l'API des catégories:", error);
      setCategories([]);
    }
  };

  // Charger les images au montage et selon les paramètres d'URL
  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
    loadCategories();
    loadImages();
  }, [searchParams]);

  // Filtrer les images selon la catégorie sélectionnée
  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredImages(images);
    } else {
      setFilteredImages(
        images.filter((img) =>
          imageMatchesCategory(img.category, selectedCategory)
        )
      );
    }
  }, [images, selectedCategory]);

  const loadImages = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/api/images?projectId=${PROJECT_ID}`
      );
      if (response.ok) {
        const data = await response.json();
        setImages(data);
      } else {
        console.error("Erreur lors du chargement des images");
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Veuillez sélectionner une image");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("L'image ne doit pas dépasser 10MB");
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!hasWriteAccess) {
      showViewerError();
      return;
    }
    
    if (!selectedFile) return;

    try {
      setUploading(true);

      // Upload de l'image
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadResponse = await fetch(
        `${IMAGE_API_URL}?projectId=${PROJECT_ID}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("Erreur lors de l'upload de l'image");
      }

      const uploadResult = await uploadResponse.json();
      let imageUrl = uploadResult.url || uploadResult.imageUrl;

      if (imageUrl) {
        imageUrl = imageUrl.replace("http://", "https://");
      }

      // Charger l'image pour obtenir ses dimensions réelles
      let crop = { x: 0, y: 0, size: 100 };
      let cropData = null;
      try {
        const img = new window.Image();
        await new Promise((resolve, reject) => {
          img.onload = () => resolve(true);
          img.onerror = reject;
          img.src = imageUrl;
        });

        // Générer crop basique
        crop = getCenteredMaxCrop(
          img.naturalWidth,
          img.naturalHeight,
          newImageMeta.dimension
        );

        // Générer cropData détaillé pour le rendu optimal
        const [rw, rh] = newImageMeta.dimension;
        const cropAspect = rw / rh;
        let cropW = img.naturalWidth;
        let cropH = img.naturalHeight;

        if (img.naturalWidth / img.naturalHeight > cropAspect) {
          // Image plus large que le ratio : hauteur limite
          cropH = img.naturalHeight;
          cropW = cropH * cropAspect;
        } else {
          // Image plus haute (ou égale) que le ratio : largeur limite
          cropW = img.naturalWidth;
          cropH = cropW / cropAspect;
        }

        // Position centrée
        const cropX = (img.naturalWidth - cropW) / 2;
        const cropY = (img.naturalHeight - cropH) / 2;

        cropData = {
          originalWidth: img.naturalWidth,
          originalHeight: img.naturalHeight,
          cropX: cropX,
          cropY: cropY,
          cropWidth: cropW,
          cropHeight: cropH,
          aspectRatio: cropAspect,
        };
      } catch (e) {
        // fallback crop par défaut
        console.error("Erreur lors du calcul du crop:", e);
      }

      // Création des métadonnées
      const metadata = {
        image_url: imageUrl,
        category: newImageMeta.category,
        alt: newImageMeta.alt,
        titre: newImageMeta.titre,
        sousTitre: newImageMeta.sousTitre,
        dimension: newImageMeta.dimension,
        crop,
        cropData,
        selected: false,
        position: newImageMeta.position,
      };

      const metaResponse = await fetch(
        `${API_URL}/api/images?projectId=${PROJECT_ID}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(metadata),
        }
      );

      if (!metaResponse.ok) {
        throw new Error("Erreur lors de la sauvegarde des métadonnées");
      }

      // Reset du formulaire
      setSelectedFile(null);
      setPreviewUrl("");
      setNewImageMeta({
        category: ["Theater"],
        alt: "",
        titre: "",
        sousTitre: "",
        dimension: [1, 1],
        position: 0,
      });

      // Recharger la liste
      loadImages();
      setNotification({
        message: "Image uploadée avec succès!",
        type: "success",
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Erreur upload:", error);
      setNotification({ message: "Erreur lors de l'upload", type: "error" });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!hasWriteAccess) {
      showViewerError();
      return;
    }
    
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette image ?")) return;

    try {
      const response = await fetch(
        `${API_URL}/api/images/${id}?projectId=${PROJECT_ID}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        loadImages();
        setNotification({
          message: "Image supprimée avec succès",
          type: "success",
        });
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification({
          message: "Erreur lors de la suppression",
          type: "error",
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la suppression");
    }
  };

  const handleToggleVisibility = async (image: ImageMeta) => {
    if (!hasWriteAccess) {
      showViewerError();
      return;
    }
    
    try {
      const updatedImage = { ...image, selected: !image.selected };

      const response = await fetch(
        `${API_URL}/api/images/${image.id}?projectId=${PROJECT_ID}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedImage),
        }
      );

      if (response.ok) {
        // Mettre à jour seulement l'état local sans recharger depuis l'API
        setImages((prevImages) =>
          prevImages.map((img) =>
            img.id === image.id ? { ...img, selected: !img.selected } : img
          )
        );
      } else {
        alert("Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la mise à jour");
    }
  };

  const handleSaveEdit = async (updatedImage: ImageMeta) => {
    if (!hasWriteAccess) {
      showViewerError();
      return;
    }
    
    try {
      const response = await fetch(
        `${API_URL}/api/images/${updatedImage.id}?projectId=${PROJECT_ID}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedImage),
        }
      );

      if (response.ok) {
        setEditingImage(null);
        // Mettre à jour seulement l'état local sans recharger depuis l'API
        setImages((prevImages) =>
          prevImages.map((img) =>
            img.id === updatedImage.id ? updatedImage : img
          )
        );
        setNotification({
          message: "Image mise à jour avec succès",
          type: "success",
        });
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification({
          message: "Erreur lors de la mise à jour",
          type: "error",
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error("Erreur:", error);
      setNotification({
        message: "Erreur lors de la mise à jour",
        type: "error",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);

    const newParams = new URLSearchParams(searchParams.toString());
    if (category === "All") {
      newParams.delete("category");
    } else {
      newParams.set("category", category);
    }

    const newUrl = `/admin/images${
      newParams.toString() ? "?" + newParams.toString() : ""
    }`;
    router.replace(newUrl, { scroll: false });
  };

  const handleCropChange = (crop: { x: number; y: number; size: number }) => {
    if (croppingImage) {
      setCroppingImage((prev) => (prev ? { ...prev, crop } : null));
    }
  };

  const handleDimensionChange = (newDimension: [number, number]) => {
    if (croppingImage) {
      // Charger l'image pour obtenir ses dimensions réelles
      const img = new window.Image();
      img.onload = () => {
        const crop = getCenteredMaxCrop(
          img.naturalWidth,
          img.naturalHeight,
          newDimension
        );
        setCroppingImage((prev) =>
          prev
            ? {
                ...prev,
                dimension: newDimension,
                crop,
              }
            : null
        );
      };
      img.src = croppingImage.image_url;
    }
  };

  const handleSaveCrop = async () => {
    if (!hasWriteAccess) {
      showViewerError();
      return;
    }
    
    if (!croppingImage) return;

    try {
      const response = await fetch(
        `${API_URL}/api/images/${croppingImage.id}?projectId=${PROJECT_ID}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(croppingImage),
        }
      );

      if (response.ok) {
        // Mettre à jour l'état local
        setImages((prevImages) =>
          prevImages.map((img) =>
            img.id === croppingImage.id ? croppingImage : img
          )
        );
        setCroppingImage(null);
        setNotification({
          message: "Recadrage sauvegardé avec succès",
          type: "success",
        });
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification({
          message: "Erreur lors de la sauvegarde du recadrage",
          type: "error",
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la sauvegarde du recadrage");
    }
  };

  if (loading) {
    return (
      <NoSSR>
        <div
          suppressHydrationWarning={true}
          className="min-h-screen bg-gray-50"
        >
          <Header />

          <AdminLayout>
            <div className="max-w-7xl mx-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Administration - Images
                </h1>
              </div>
              {/* Zone blanche pendant le chargement */}
              <div className="bg-white rounded-lg shadow-md p-6 min-h-96"></div>
            </div>
          </AdminLayout>
          <PortfolioFooter />
        </div>
      </NoSSR>
    );
  }

  return (
    <NoSSR>
      <div suppressHydrationWarning={true}>
        <div suppressHydrationWarning={true} className="min-h-screen">
        <Header />
        {notification && (
          <div
            className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white text-center font-semibold transition-all ${
              notification.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {notification.message}
          </div>
        )}
        <AdminLayout>
          <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Administration - Images ({filteredImages.length})
              </h1>
            </div>

            {/* Section Upload */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-900">
                <HiOutlineCloud className="mr-2" />
                Ajouter une nouvelle image
              </h2>
              <div
                className="mx-auto w-full"
                // style={{maxWidth: "1200px"}}
              >
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
                          <img
                            src={previewUrl}
                            alt="Aperçu"
                            className="max-h-48 mx-auto rounded"
                          />
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
                        {categories
                          .filter((cat) => cat.isActive)
                          .map((cat) => (
                            <label
                              key={cat.value}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                checked={newImageMeta.category.includes(
                                  cat.value
                                )}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewImageMeta((prev) => ({
                                      ...prev,
                                      category: [...prev.category, cat.value],
                                    }));
                                  } else {
                                    setNewImageMeta((prev) => ({
                                      ...prev,
                                      category: prev.category.filter(
                                        (c) => c !== cat.value
                                      ),
                                    }));
                                  }
                                }}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-900">
                                {cat.label}
                              </span>
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
                        onChange={(e) =>
                          setNewImageMeta((prev) => ({
                            ...prev,
                            titre: e.target.value,
                          }))
                        }
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
                        onChange={(e) =>
                          setNewImageMeta((prev) => ({
                            ...prev,
                            sousTitre: e.target.value,
                          }))
                        }
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
                        onChange={(e) =>
                          setNewImageMeta((prev) => ({
                            ...prev,
                            alt: e.target.value,
                          }))
                        }
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
                        onChange={(e) =>
                          setNewImageMeta((prev) => ({
                            ...prev,
                            dimension: JSON.parse(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      >
                        {dimensions.map((dim, index) => (
                          <option key={index} value={JSON.stringify(dim.value)}>
                            {dim.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Position
                      </label>
                      <input
                        type="number"
                        value={newImageMeta.position}
                        onChange={(e) =>
                          setNewImageMeta((prev) => ({
                            ...prev,
                            position: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        placeholder="Position dans l'ordre d'affichage"
                        min="0"
                      />
                    </div>

                    <button
                      onClick={handleUpload}
                      disabled={!selectedFile || uploading}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? "Upload en cours..." : "Uploader l'image"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Filtres */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCategoryChange("All")}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedCategory === "All"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-700"
                  }`}
                >
                  Toutes ({images.length})
                </button>
                {categories
                  .filter((cat) => cat.isActive)
                  .map((category) => {
                    const count = images.filter((img) =>
                      imageMatchesCategory(img.category, category.value)
                    ).length;
                    const colorClass = getCategoryColor(category.value);
                    return (
                      <button
                        key={category.value}
                        onClick={() => handleCategoryChange(category.value)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedCategory === category.value
                            ? `${colorClass} bg-blue-300 text-black`
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {category.label} ({count})
                      </button>
                    );
                  })}
                {/* Affichage des catégories supprimées si des images y sont associées */}
                {categories
                  .filter((cat) => !cat.isActive)
                  .map((category) => {
                    const count = images.filter((img) =>
                      imageMatchesCategory(img.category, category.value)
                    ).length;
                    if (count === 0) return null;
                    return (
                      <button
                        key={category.value}
                        onClick={() => handleCategoryChange(category.value)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors opacity-50 ${
                          selectedCategory === category.value
                            ? "bg-red-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                        title="Catégorie supprimée - contient encore des images"
                      >
                        {category.label} ({count}) [Supprimée]
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Grille d'images */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={image.image_url}
                      alt={image.alt}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={() => hasWriteAccess ? setCroppingImage(image) : showViewerError()}
                        className="p-1 bg-purple-600 text-white rounded-full hover:bg-purple-700"
                        title="Recadrer"
                      >
                        <HiOutlineFunnel className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleVisibility(image)}
                        className={`p-1 rounded-full ${
                          image.selected
                            ? "bg-green-600 text-white"
                            : "bg-gray-600 text-white"
                        }`}
                        title={
                          image.selected ? "Désélectionner" : "Sélectionner"
                        }
                      >
                        {image.selected ? (
                          <HiOutlineEye className="w-4 h-4" />
                        ) : (
                          <HiOutlineEyeSlash className="w-4 h-4" />
                        )}
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
                          onChange={(e) =>
                            setEditingImage((prev) =>
                              prev ? { ...prev, titre: e.target.value } : null
                            )
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Titre"
                        />
                        <input
                          type="text"
                          value={editingImage.sousTitre}
                          onChange={(e) =>
                            setEditingImage((prev) =>
                              prev
                                ? { ...prev, sousTitre: e.target.value }
                                : null
                            )
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Sous-titre"
                        />

                        {/* Catégories multiples */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Catégories
                          </label>
                          <div className="grid grid-cols-2 gap-1">
                            {categories
                              .filter((cat) => cat.isActive)
                              .map((cat) => (
                                <label
                                  key={cat.value}
                                  className="flex items-center space-x-1 text-xs"
                                >
                                  <input
                                    type="checkbox"
                                    checked={normalizeCategoriesArray(
                                      editingImage.category
                                    ).includes(cat.value)}
                                    onChange={(e) => {
                                      const currentCategories =
                                        normalizeCategoriesArray(
                                          editingImage.category
                                        );
                                      if (e.target.checked) {
                                        setEditingImage((prev) =>
                                          prev
                                            ? {
                                                ...prev,
                                                category: [
                                                  ...currentCategories,
                                                  cat.value,
                                                ] as any,
                                              }
                                            : null
                                        );
                                      } else {
                                        setEditingImage((prev) =>
                                          prev
                                            ? {
                                                ...prev,
                                                category:
                                                  currentCategories.filter(
                                                    (c) => c !== cat.value
                                                  ) as any,
                                              }
                                            : null
                                        );
                                      }
                                    }}
                                    className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <span className="text-gray-900">
                                    {cat.label}
                                  </span>
                                </label>
                              ))}
                            {/* Affichage des catégories supprimées pour les images qui y sont associées */}
                            {categories
                              .filter(
                                (cat) =>
                                  !cat.isActive &&
                                  normalizeCategoriesArray(
                                    editingImage.category
                                  ).includes(cat.value)
                              )
                              .map((cat) => (
                                <label
                                  key={cat.value}
                                  className="flex items-center space-x-1 text-xs opacity-50"
                                >
                                  <input
                                    type="checkbox"
                                    checked={true}
                                    onChange={(e) => {
                                      if (!e.target.checked) {
                                        const currentCategories =
                                          normalizeCategoriesArray(
                                            editingImage.category
                                          );
                                        setEditingImage((prev) =>
                                          prev
                                            ? {
                                                ...prev,
                                                category:
                                                  currentCategories.filter(
                                                    (c) => c !== cat.value
                                                  ) as any,
                                              }
                                            : null
                                        );
                                      }
                                    }}
                                    className="h-3 w-3 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                  />
                                  <span className="text-red-700">
                                    {cat.label} [Supprimée]
                                  </span>
                                </label>
                              ))}
                          </div>
                        </div>

                        {/* Position */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Position
                          </label>
                          <input
                            type="number"
                            value={editingImage.position}
                            onChange={(e) =>
                              setEditingImage((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      position: parseInt(e.target.value) || 0,
                                    }
                                  : null
                              )
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Position"
                            min="0"
                          />
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
                          onClick={() => hasWriteAccess ? setEditingImage(image) : showViewerError()}
                          className="absolute top-0 left-0 p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 z-10"
                          title="Modifier les métadonnées"
                        >
                          <HiOutlinePencil className="w-3 h-3" />
                        </button>
                        <div className="ml-6">
                          <h3 className="font-medium text-sm truncate text-black">
                            {image.titre || "Sans titre"}
                          </h3>
                          <p className="text-xs text-gray-600 truncate">
                            {image.sousTitre || "Sans sous-titre"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {Array.isArray(image.dimension)
                              ? image.dimension.join("×")
                              : "1×1"}{" "}
                            • Position:{" "}
                            {typeof image.position === "object"
                              ? "0"
                              : image.position}{" "}
                            •{" "}
                            {image.selected ? "Sélectionné" : "Non sélectionné"}
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
                      Recadrer l'image - {croppingImage.titre || "Sans titre"}
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
                    readOnly={!hasWriteAccess}
                  />

                  <div className="flex gap-2 mt-6 pt-4 border-t">
                    <button
                      onClick={() => hasWriteAccess ? handleSaveCrop() : showViewerError()}
                      className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                        hasWriteAccess 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!hasWriteAccess}
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
      </div>
    </NoSSR>
  );
};

export default ImagesAdmin;
