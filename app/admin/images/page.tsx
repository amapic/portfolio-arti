"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ImageMeta } from "../../types/imageMeta";
import {
  HiOutlinePencil,
} from "react-icons/hi2";
import { HiOutlineX } from "react-icons/hi";
// Bootstrap Icons
import {
  BsCloudUpload,
  BsImages,
  BsGrid3X3Gap,
  BsCardImage,
  BsInfoCircle,
  BsCheckCircle,
  BsXCircle,
  BsCrop,
  BsEye,
  BsEyeSlash,
  BsTrash
} from "react-icons/bs";
import NoSSR from "../../components/NoSSR";
import { Header } from "../../components/Header";
import { useAuth } from "../../components/SimpleAuthProvider";
import PortfolioFooter from "../../components/PortfolioFooter";
import ImageCropper from "../../components/ImageCropper";
import Link from 'next/link';

// Types pour les catégories (maintenant chargées dynamiquement)
interface Category {
  id: string;
  value: string;
  label: string;
  order: number;
  isActive: boolean;
}

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
  const [showUploadForm, setShowUploadForm] = useState(false);
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
        setCategories(data);
      } else {
        console.error("Erreur lors du chargement des catégories");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
    }
  };

  // Charger les données au démarrage
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
        console.error("Erreur lors du chargement des images", response.status);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const url = new URL(window.location.href);
    if (category === "All") {
      url.searchParams.delete("category");
    } else {
      url.searchParams.set("category", category);
    }
    router.push(url.pathname + url.search);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Veuillez sélectionner un fichier");
      return;
    }

    if (!hasWriteAccess) {
      showViewerError();
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("projectId", PROJECT_ID || "");
      formData.append("category", JSON.stringify(newImageMeta.category));
      formData.append("alt", newImageMeta.alt);
      formData.append("titre", newImageMeta.titre);
      formData.append("sousTitre", newImageMeta.sousTitre);
      formData.append("dimension", JSON.stringify(newImageMeta.dimension));
      formData.append("position", newImageMeta.position.toString());

      const response = await fetch(`${API_URL}/api/images`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setNotification({
          message: "Image uploadée avec succès !",
          type: "success",
        });
        setTimeout(() => setNotification(null), 3000);

        // Reset form
        setSelectedFile(null);
        setPreviewUrl("");
        setNewImageMeta({
          category: [],
          alt: "",
          titre: "",
          sousTitre: "",
          dimension: [1, 1],
          position: 0,
        });
        document.getElementById("imageUpload")?.setAttribute("value", "");

        // Reload images
        loadImages();
      } else {
        throw new Error("Erreur lors de l'upload");
      }
    } catch (error) {
      setNotification({
        message: "Erreur lors de l'upload de l'image",
        type: "error",
      });
      setTimeout(() => setNotification(null), 3000);
      console.error("Erreur upload:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!hasWriteAccess) {
      showViewerError();
      return;
    }

    if (!confirm("Êtes-vous sûr de vouloir supprimer cette image ?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/images/${imageId}?projectId=${PROJECT_ID}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setNotification({
          message: "Image supprimée avec succès !",
          type: "success",
        });
        setTimeout(() => setNotification(null), 3000);
        loadImages();
      } else {
        throw new Error("Erreur lors de la suppression");
      }
    } catch (error) {
      setNotification({
        message: "Erreur lors de la suppression de l'image",
        type: "error",
      });
      setTimeout(() => setNotification(null), 3000);
      console.error("Erreur suppression:", error);
    }
  };

  const handleToggleVisibility = async (image: ImageMeta) => {
    if (!hasWriteAccess) {
      showViewerError();
      return;
    }

    try {
      const updatedImage = { ...image, isVisible: !(image.isVisible ?? true) };
      const response = await fetch(
        `${API_URL}/api/images/${image.id}?projectId=${PROJECT_ID}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedImage),
        }
      );

      if (response.ok) {
        setNotification({
          message: `Image ${updatedImage.isVisible ? "rendue visible" : "masquée"
            } avec succès !`,
          type: "success",
        });
        setTimeout(() => setNotification(null), 3000);
        loadImages();
      } else {
        throw new Error("Erreur lors de la mise à jour");
      }
    } catch (error) {
      setNotification({
        message: "Erreur lors de la mise à jour de la visibilité",
        type: "error",
      });
      setTimeout(() => setNotification(null), 3000);
      console.error("Erreur visibilité:", error);
    }
  };

  const [cropToSave, setCropToSave] = useState<any>(null);

  const handleSaveCrop = async (imageId: string, crop: any) => {
    if (!hasWriteAccess) {
      showViewerError();
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/images/${imageId}?projectId=${PROJECT_ID}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ crop }),
        }
      );

      if (response.ok) {
        setNotification({
          message: "Recadrage sauvegardé avec succès !",
          type: "success",
        });
        setTimeout(() => setNotification(null), 3000);
        setCroppingImage(null);
        loadImages();
      } else {
        throw new Error("Erreur lors de la sauvegarde du recadrage");
      }
    } catch (error) {
      setNotification({
        message: "Erreur lors de la sauvegarde du recadrage",
        type: "error",
      });
      setTimeout(() => setNotification(null), 3000);
      console.error("Erreur recadrage:", error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <NoSSR>
        <div
          suppressHydrationWarning={true}
          className="min-h-[calc(100vh-60px)] bg-gray-50 overflow-x-hidden"
        >
          <Header />
          {notification && (
            <div
              className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white text-center font-semibold transition-all flex items-center gap-2 ${notification.type === "success" ? "bg-customgreen" : "bg-customred"
                }`}
            >
              {notification.type === "success" ? (
                <BsCheckCircle className="w-5 h-5" />
              ) : (
                <BsXCircle className="w-5 h-5" />
              )}
              {notification.message}
            </div>
          )}
          <div className="w-[80%] mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Administration - Images
              </h1>
            </div>
            {/* Zone blanche pendant le chargement */}
            <div className="bg-white rounded-lg shadow-md p-6 min-h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des images...</p>
              </div>
            </div>
          </div>
          <PortfolioFooter />
        </div>
      </NoSSR>
    );
  }

  // Main interface
  return (
    <NoSSR>
      <div suppressHydrationWarning={true} className="min-h-screen overflow-x-hidden">
        <Header />
        {notification && (
            <div
              className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white text-center font-semibold transition-all flex items-center gap-2 ${notification.type === "success" ? "bg-customgreen" : "bg-customred"
                }`}
            >
              {notification.type === "success" ? (
                <BsCheckCircle className="w-5 h-5" />
              ) : (
                <BsXCircle className="w-5 h-5" />
              )}
              {notification.message}
            </div>
          )}
          
          {/* Layout avec sidebar */}
          <div className="flex w-full overflow-x-hidden ">
            {/* Sidebar gauche */}
            <div className="ml-2 mt-2 max-w-80 w-1/4 bg-white border-r border-gray-200 h-[calc(100vh-100px)] flex flex-col fixed left-0 top-[61px] z-0 shadow-lg">
              {/* Header du sidebar */}
              <div className="p-6 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-900 flex items-center">
                  <BsImages className="mr-3 w-6 h-6 text-blue-600" />
                  Images { !showUploadForm && `(${filteredImages.length})` }
                </h1>
              </div>

              {/* Filtres */}
              <div className="flex-1 p-6 overflow-y-auto">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h2>
                {!showUploadForm && (loading ? (
                  // Skeleton loader pour les filtres
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="w-full h-10 bg-gray-200 rounded-md animate-pulse"
                      ></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleCategoryChange("All")}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedCategory === "All"
                          ? "bg-customblue text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                        return (
                          <button
                            key={category.value}
                            onClick={() => handleCategoryChange(category.value)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedCategory === category.value
                                ? "bg-customblue text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                          >
                            {category.label} ({count})
                          </button>
                        );
                      })}
                    {/* Catégories supprimées */}
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
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors opacity-50 ${selectedCategory === category.value
                                ? "bg-customred text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            title="Catégorie supprimée - contient encore des images"
                          >
                            {category.label} ({count}) [Supprimée]
                          </button>
                        );
                      })}
                  </div>
                ))}
              </div>

              {/* Bouton ajouter image en bas */}
              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowUploadForm(!showUploadForm)}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
                    showUploadForm
                      ? "bg-gray-600 text-white hover:bg-gray-700"
                      : "bg-customgreen text-white hover:bg-customgreendark"
                  }`}
                >
                  {showUploadForm ? (
                    <>
                      <BsGrid3X3Gap className="mr-2 w-5 h-5" />
                      Voir les images
                    </>
                  ) : (
                    <>
                      <BsCloudUpload className="mr-2 w-5 h-5" />
                      Ajouter une image
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Contenu principal */}
            <div className={`flex-1 pl-[4px] p-8 pt-12 ml-[min(20rem,25%)] relative overflow-x-hidden ${showUploadForm ? 'h-[calc(100vh-100px)] overflow-y-hidden' : ''}`}>
              {/* Section Upload avec transition */}
              <div 
                className={`bg-white rounded-lg h-full shadow-md ml-8 p-6 transition-all ease-in-out will-change-transform ${
                  showUploadForm 
                    ? 'relative opacity-100 translate-x-0 duration-500'
                    : 'absolute inset-0 opacity-0 -translate-x-full pointer-events-none duration-0'
                }`}
              >
                  <h2 className="text-lg font-semibold mb-6 flex items-center text-gray-900">
                    <BsCloudUpload className="mr-3 w-6 h-6" />
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
                            <img
                              src={previewUrl}
                              alt="Aperçu"
                              className="max-h-48 mx-auto rounded"
                            />
                          ) : (
                            <div className="py-8">
                              <BsCardImage className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                              <p className="text-base font-medium text-gray-900 mb-2">
                                Cliquez pour sélectionner une image
                              </p>
                              <p className="text-sm text-gray-500">
                                PNG, JPG, GIF jusqu'à 10MB
                              </p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Métadonnées */}
                    <div className="space-y-4">
                      <div>
                        <label className="inline-flex items-center text-sm rounded-t-md font-medium text-gray-900 bg-customyellow mb-0 pr-6">
                          <span className="mx-2 text-2xl text-white pb-1">●</span>
                          Catégories
                        </label>
                        <div className="grid grid-cols-2 gap-2 w-full px-3 py-1 border-[5px] border-customyellow rounded-b-md rounded-tr-md focus:outline-none focus:ring-0 focus:border-customyellow text-gray-900 bg-customyellow mt-0">
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
                        <label className="inline-flex items-center text-sm rounded-t-md font-medium text-gray-900 bg-customblue mb-0 pr-6">
                          <span className="mx-2 text-2xl text-white pb-1">●</span>
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
                          className="w-full px-3 py-1 border-[5px] border-customblue rounded-b-md rounded-tr-md focus:outline-none focus:ring-0 focus:border-customblue text-gray-900 bg-white mt-0"
                          placeholder="Titre de l'image"
                        />
                      </div>

                      <div>
                        <label className="inline-flex items-center text-sm rounded-t-md font-medium text-gray-900 bg-customred mb-0 pr-6">
                          <span className="mx-2 text-2xl text-white pb-1">●</span>
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
                          className="w-full px-3 py-1 border-[5px] border-customred rounded-b-md rounded-tr-md focus:outline-none focus:ring-0 focus:border-customred text-gray-900 bg-white mt-0"
                          placeholder="Sous-titre de l'image"
                        />
                      </div>

                      <div>
                        <label className="inline-flex items-center text-sm rounded-t-md font-medium text-gray-900 bg-customblue mb-0 pr-6">
                          <span className="mx-2 text-2xl text-white pb-1">●</span>
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
                          className="w-full px-3 py-1 border-[5px] border-customblue rounded-b-md rounded-tr-md focus:outline-none focus:ring-0 focus:border-customblue text-gray-900 bg-white mt-0"
                          placeholder="Description pour l'accessibilité"
                        />
                      </div>

                      <div>
                        <label className="inline-flex items-center text-sm rounded-t-md font-medium text-gray-900 bg-gray-600 mb-0 pr-6">
                          <span className="mx-2 text-2xl text-white pb-1">●</span>
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
                          className="w-full px-3 py-1 border-[5px] border-gray-600 rounded-b-md rounded-tr-md focus:outline-none focus:ring-0 focus:border-gray-600 text-gray-900 bg-white mt-0"
                        >
                          {dimensions.map((dim, index) => (
                            <option key={index} className="bg-gray-100" value={JSON.stringify(dim.value)}>
                              {dim.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="inline-flex items-center text-sm rounded-t-md font-medium text-gray-900 bg-gray-600 mb-0 pr-6">
                          <span className="mx-2 text-2xl text-white pb-1">●</span>
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
                          className="w-full px-3 py-1 border-[5px] border-gray-600 rounded-b-md rounded-tr-md focus:outline-none focus:ring-0 focus:border-gray-600 text-gray-900 bg-white mt-0"
                          placeholder="Position dans l'ordre d'affichage"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={handleUpload}
                      disabled={!selectedFile || uploading}
                      className="w-1/2 px-4 py-2 bg-customgreen text-white rounded-md hover:bg-customgreendark disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? "Upload en cours..." : "Uploader l'image"}
                    </button>
                  </div>
                  </div>

              {/* Grille d'images avec transition */}
              <div 
                className={`mt-2 pl-8 transition-all ease-in-out will-change-transform  ${
                  !showUploadForm 
                    ? 'relative opacity-100 translate-x-0 duration-500' 
                    : 'absolute inset-0 opacity-0 translate-x-full pointer-events-none duration-0 '
                }`}
              >
                  {/* <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <BsGrid3X3Gap className="mr-3 w-6 h-6" />
                    Images ({loading ? "..." : filteredImages.length})
                  </h2> */}
                  
                  {loading ? (
                    // Skeleton loader pour la grille d'images
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div
                          key={i}
                          className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
                        >
                          <div className="w-full h-48 bg-gray-300"></div>
                          <div className="p-4 space-y-3">
                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            <div className="flex gap-2">
                              <div className="h-6 bg-gray-200 rounded w-16"></div>
                              <div className="h-6 bg-gray-200 rounded w-16"></div>
                            </div>
                            <div className="flex gap-2">
                              <div className="w-8 h-8 bg-gray-200 rounded"></div>
                              <div className="w-8 h-8 bg-gray-200 rounded"></div>
                              <div className="w-8 h-8 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredImages.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                      <BsImages className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucune image trouvée
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {selectedCategory === "All"
                          ? "Aucune image n'a été ajoutée pour le moment."
                          : `Aucune image dans la catégorie "${getCategoryLabel(selectedCategory)}".`}
                      </p>
                      <button
                        onClick={() => setShowUploadForm(true)}
                        className="px-4 py-2 bg-customgreen text-white rounded-md hover:bg-customgreendark"
                      >
                        Ajouter une image
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredImages.map((image) => (
                        <div
                          key={image.id}
                          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                        >
                          <div className="relative">
                            <img
                              src={image.filename ? `${IMAGE_API_URL}/${image.filename}` : image.image_url}
                              alt={image.alt || "Image"}
                              className="w-full h-48 object-cover"
                            />
                            {!(image.isVisible ?? true) && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <span className="text-white font-medium">Masquée</span>
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium text-gray-900 mb-1">
                              {image.titre || "Sans titre"}
                            </h3>
                            <p className="text-sm text-gray-500 mb-2">
                              {image.sousTitre || "Sans sous-titre"}
                            </p>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {normalizeCategoriesArray(image.category).map(
                                (cat) => (
                                  <span
                                    key={cat}
                                    className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                                  >
                                    {getCategoryLabel(cat)}
                                  </span>
                                )
                              )}
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setCroppingImage(image)}
                                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Recadrer"
                                >
                                  <BsCrop className="w-4 h-4 text-customblue" />
                                </button>
                                <button
                                  onClick={() => handleToggleVisibility(image)}
                                  className={`p-2 rounded transition-colors ${(image.isVisible ?? true)
                                      ? "text-gray-600 hover:text-yellow-600 hover:bg-yellow-50"
                                      : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                                    }`}
                                  title={
                                    (image.isVisible ?? true) ? "Masquer" : "Rendre visible"
                                  }
                                >
                                  {(image.isVisible ?? true) ? (
                                    <BsEye className="w-4 h-4 text-customyellow" />
                                  ) : (
                                    <BsEyeSlash className="w-4 h-4 text-customyellow" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDeleteImage(image.id)}
                                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Supprimer"
                                >
                                  <BsTrash className="w-4 h-4 text-customred" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                      imageUrl={croppingImage.filename ? `${IMAGE_API_URL}/${croppingImage.filename}` : croppingImage.image_url}
                      dimension={croppingImage.dimension}
                      initialCrop={croppingImage.crop}
                      onCropChange={(crop) => setCropToSave(crop)}
                    />
                    <div className="flex justify-end space-x-2 mt-4">
                      <button
                        onClick={() => setCroppingImage(null)}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => {
                          if (cropToSave) {
                            handleSaveCrop(croppingImage.id, cropToSave);
                          }
                        }}
                        className="px-4 py-2 bg-customgreen text-white rounded hover:bg-customgreendark"
                      >
                        Sauvegarder
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <PortfolioFooter />
        </div>
      </NoSSR>
  );
};

export default ImagesAdmin;