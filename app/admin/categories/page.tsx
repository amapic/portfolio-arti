"use client";

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Header } from '../../components/Header';
import { useAuth } from '../../components/AuthProvider';
import NoSSR from '../../components/NoSSR';
import PortfolioFooter from '../../components/PortfolioFooter';
import BarbaWrapper from '../../components/BarbaWrapper';
import BarbaLink from '../../components/BarbaLink';

interface Category {
  id: string;
  value: string;
  label: string;
  order: number;
  isActive: boolean;
}

const CategoriesAdmin: React.FC = () => {
  const { logout, user, hasWriteAccess } = useAuth();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const PROJECT_ID = process.env.NEXT_PUBLIC_ID_PROJET;

  // Fonction pour afficher l'erreur de permissions pour les viewers
  const showViewerError = () => {
    showMessage('error', 'Modification impossible en mode viewer');
  };

  // Template pour une nouvelle catégorie
  const newCategoryTemplate: Omit<Category, 'id'> = {
    value: '',
    label: '',
    order: 0,
    isActive: true
  };

  // Charger les catégories depuis l'API
  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/categories?projectId=${PROJECT_ID}`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.sort((a: Category, b: Category) => a.order - b.order));
      } else {
        console.error('Erreur lors du chargement des catégories');
        showMessage('error', 'Erreur lors du chargement des catégories');
      }
    } catch (error) {
      console.error('Erreur de connexion à l\'API:', error);
      showMessage('error', 'Erreur de connexion à l\'API');
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder une catégorie (création ou modification)
  const saveCategory = async (category: Category | Omit<Category, 'id'>) => {
    if (!hasWriteAccess) {
      showViewerError();
      return;
    }
    
    try {
      const isNew = !('id' in category);
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew 
        ? `${API_URL}/api/categories?projectId=${PROJECT_ID}`
        : `${API_URL}/api/categories/${(category as Category).id}?projectId=${PROJECT_ID}`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
      });

      if (response.ok) {
        showMessage('success', isNew ? 'Catégorie créée avec succès' : 'Catégorie mise à jour avec succès');
        loadCategories();
        setEditingCategory(null);
        setIsAddingNew(false);
      } else {
        showMessage('error', 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showMessage('error', 'Erreur de connexion');
    }
  };

  // Supprimer une catégorie
  const deleteCategory = async (id: string) => {
    if (!hasWriteAccess) {
      showViewerError();
      return;
    }
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

    try {
      const response = await fetch(`${API_URL}/api/categories/${id}?projectId=${PROJECT_ID}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showMessage('success', 'Catégorie supprimée avec succès');
        loadCategories();
      } else {
        showMessage('error', 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showMessage('error', 'Erreur de connexion');
    }
  };

  // Réorganiser les catégories
  const reorderCategories = async (newOrder: Category[]) => {
    if (!hasWriteAccess) {
      showViewerError();
      return;
    }
    
    const updatedCategories = newOrder.map((cat, index) => ({
      ...cat,
      order: index
    }));

    try {
      const response = await fetch(`${API_URL}/api/categories?projectId=${PROJECT_ID}&action=reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCategories)
      });

      if (response.ok) {
        setCategories(updatedCategories);
        showMessage('success', 'Ordre des catégories mis à jour');
      } else {
        showMessage('error', 'Erreur lors de la réorganisation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showMessage('error', 'Erreur de connexion');
    }
  };

  // Afficher un message temporaire
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Déplacer une catégorie vers le haut ou le bas
  const moveCategory = (index: number, direction: 'up' | 'down') => {
    const newCategories = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newCategories.length) {
      [newCategories[index], newCategories[targetIndex]] = [newCategories[targetIndex], newCategories[index]];
      reorderCategories(newCategories);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = (e: React.FormEvent, category: Category | Omit<Category, 'id'>) => {
    e.preventDefault();
    
    // Validation
    if (!category.value.trim() || !category.label.trim()) {
      showMessage('error', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Vérifier l'unicité de la valeur
    const isDuplicate = categories.some(cat => 
      cat.value.toLowerCase() === category.value.toLowerCase() && 
      ('id' in category ? cat.id !== category.id : true)
    );

    if (isDuplicate) {
      showMessage('error', 'Cette valeur de catégorie existe déjà');
      return;
    }

    saveCategory(category);
  };

  if (loading) {
    return (
      <BarbaWrapper namespace="admin-categories">
        <div suppressHydrationWarning={true} className="min-h-screen bg-gray-50">
          <Header />
          
          <AdminLayout>
            <div className="max-w-4xl mx-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Administration - Catégories
                </h1>
                <BarbaLink href="/admin" className="text-blue-600 hover:text-blue-800">
                  ← Retour au dashboard
                </BarbaLink>
              </div>
              {/* Zone blanche pendant le chargement */}
              <div className="bg-white rounded-lg shadow-md p-6 min-h-96">
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                </div>
              </div>
            </div>
          </AdminLayout>
          <PortfolioFooter />
        </div>
      </BarbaWrapper>
    );
  }

  return (
    <BarbaWrapper namespace="admin-categories">
      <div suppressHydrationWarning={true} className="min-h-screen bg-gray-50">
        <Header />
        
        <AdminLayout>
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Administration - Catégories
              </h1>
              <BarbaLink href="/admin" className="text-blue-600 hover:text-blue-800">
                ← Retour au dashboard
              </BarbaLink>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Gestion des Catégories</h2>
                <button
                  onClick={() => setIsAddingNew(true)}
                  disabled={!hasWriteAccess}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    hasWriteAccess 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  + Nouvelle Catégorie
                </button>
              </div>

        {/* Messages */}
        {message && (
          <div className={`p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Formulaire d'ajout */}
        {isAddingNew && (
          <CategoryForm
            category={newCategoryTemplate}
            onSubmit={(e, cat) => handleSubmit(e, cat)}
            onCancel={() => setIsAddingNew(false)}
            title="Nouvelle Catégorie"
            hasWriteAccess={hasWriteAccess}
          />
        )}

        {/* Liste des catégories */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Catégories existantes</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {categories.map((category, index) => (
              <div key={category.id}>
                {editingCategory?.id === category.id ? (
                  <CategoryForm
                    category={editingCategory}
                    onSubmit={(e, cat) => handleSubmit(e, cat)}
                    onCancel={() => setEditingCategory(null)}
                    title="Modifier la Catégorie"
                    hasWriteAccess={hasWriteAccess}
                  />
                ) : (
                  <CategoryRow
                    category={category}
                    index={index}
                    totalCount={categories.length}
                    onEdit={() => hasWriteAccess ? setEditingCategory(category) : showViewerError()}
                    onDelete={() => hasWriteAccess ? deleteCategory(category.id) : showViewerError()}
                    onMove={(direction) => hasWriteAccess ? moveCategory(index, direction) : showViewerError()}
                    hasWriteAccess={hasWriteAccess}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
            </div>
          </div>
        </AdminLayout>
        <PortfolioFooter />
      </div>
    </BarbaWrapper>
  );
};

// Composant pour afficher une ligne de catégorie
const CategoryRow: React.FC<{
  category: Category;
  index: number;
  totalCount: number;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (direction: 'up' | 'down') => void;
  hasWriteAccess: boolean;
}> = ({ category, index, totalCount, onEdit, onDelete, onMove, hasWriteAccess }) => (
  <div className="px-6 py-4 flex items-center justify-between">
    <div className="flex items-center space-x-4">
      <div className="flex flex-col space-y-2">
        <button
          onClick={() => onMove('up')}
          disabled={index === 0 || !hasWriteAccess}
          className={`p-1 transition-colors ${
            hasWriteAccess && index !== 0 
              ? 'text-gray-400 hover:text-gray-600' 
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          ↑
        </button>
        <button
          onClick={() => onMove('down')}
          disabled={index === totalCount - 1 || !hasWriteAccess}
          className={`p-1 transition-colors ${
            hasWriteAccess && index !== totalCount - 1 
              ? 'text-gray-400 hover:text-gray-600' 
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          ↓
        </button>
      </div>
      
      <div className="flex items-center space-x-3">
        <span className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-800">
          {category.label}
        </span>
        <div>
          <div className="font-medium text-gray-900">{category.label}</div>
          <div className="text-sm text-gray-500">Valeur: {category.value}</div>
        </div>
      </div>
    </div>

    <div className="flex items-center space-x-2">
      <span className={`px-2 py-1 text-xs rounded ${
        category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {category.isActive ? 'Actif' : 'Inactif'}
      </span>
      
      <button
        onClick={onEdit}
        disabled={!hasWriteAccess}
        className={`px-3 py-1 rounded transition-colors ${
          hasWriteAccess 
            ? 'text-blue-600 hover:text-blue-800' 
            : 'text-gray-400 cursor-not-allowed'
        }`}
      >
        Modifier
      </button>
      
      <button
        onClick={onDelete}
        disabled={!hasWriteAccess}
        className={`px-3 py-1 rounded transition-colors ${
          hasWriteAccess 
            ? 'text-red-600 hover:text-red-800' 
            : 'text-gray-400 cursor-not-allowed'
        }`}
      >
        Supprimer
      </button>
    </div>
  </div>
);

// Composant formulaire pour éditer/créer une catégorie
const CategoryForm: React.FC<{
  category: Category | Omit<Category, 'id'>;
  onSubmit: (e: React.FormEvent, category: Category | Omit<Category, 'id'>) => void;
  onCancel: () => void;
  title: string;
  hasWriteAccess: boolean;
}> = ({ category, onSubmit, onCancel, title, hasWriteAccess }) => {
  const [formData, setFormData] = useState(category);

  const colorOptions = [
    { value: 'bg-black text-white', label: 'Noir' },
    { value: 'bg-blue-600 text-white', label: 'Bleu' },
    { value: 'bg-red-600 text-white', label: 'Rouge' },
    { value: 'bg-green-600 text-white', label: 'Vert' },
    { value: 'bg-purple-600 text-white', label: 'Violet' },
    { value: 'bg-orange-600 text-white', label: 'Orange' },
    { value: 'bg-gray-600 text-white', label: 'Gris' }
  ];

  return (
    <div className="px-6 py-4 bg-gray-50">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      
      <form onSubmit={(e) => onSubmit(e, formData)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valeur technique * (utilisée dans le code)
            </label>
            <input
              type="text"
              value={formData.value}
              onChange={(e) => hasWriteAccess && setFormData({...formData, value: e.target.value})}
              disabled={!hasWriteAccess}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !hasWriteAccess ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              placeholder="ex: Theater, Dance..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Label affiché *
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => hasWriteAccess && setFormData({...formData, label: e.target.value})}
              disabled={!hasWriteAccess}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !hasWriteAccess ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              placeholder="ex: Théâtre, Danse..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={formData.isActive ? 'true' : 'false'}
              onChange={(e) => hasWriteAccess && setFormData({...formData, isActive: e.target.value === 'true'})}
              disabled={!hasWriteAccess}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !hasWriteAccess ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            >
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!hasWriteAccess}
            className={`px-4 py-2 rounded-md transition-colors ${
              hasWriteAccess 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Sauvegarder
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoriesAdmin;