// Types et constantes pour les catégories d'images

export type CategoryType = 'Theater' | 'Dance' | 'Opera' | 'Circus' | 'Event';

export interface Category {
  value: CategoryType;
  label: string;
  color: string; // Couleur pour l'affichage
}

export const CATEGORIES: Category[] = [
  { value: 'Theater', label: 'Théâtre', color: 'bg-black text-white' },
  { value: 'Dance', label: 'Danse', color: 'bg-black text-white' },
  { value: 'Opera', label: 'Opéra', color: 'bg-black text-white' },
  { value: 'Circus', label: 'Cirque', color: 'bg-black text-white' },
  { value: 'Event', label: 'Event', color: 'bg-black text-white' }
];

export const CATEGORY_VALUES = CATEGORIES.map(cat => cat.value);

export const getCategoryLabel = (value: CategoryType): string => {
  return CATEGORIES.find(cat => cat.value === value)?.label || value;
};

export const getCategoryColor = (value: CategoryType): string => {
  return CATEGORIES.find(cat => cat.value === value)?.color || 'bg-gray-100 text-gray-800';
};

// Fonctions utilitaires pour les catégories multiples
export const normalizeCategoriesArray = (categories: CategoryType | CategoryType[]): CategoryType[] => {
  return Array.isArray(categories) ? categories : [categories];
};

export const getCategoriesLabels = (categories: CategoryType | CategoryType[]): string => {
  const categoriesArray = normalizeCategoriesArray(categories);
  return categoriesArray.map(cat => getCategoryLabel(cat)).join(', ');
};

export const imageMatchesCategory = (imageCategory: CategoryType | CategoryType[], filterCategory: CategoryType | 'All'): boolean => {
  if (filterCategory === 'All') return true;
  const imageCategoriesArray = normalizeCategoriesArray(imageCategory);
  return imageCategoriesArray.includes(filterCategory);
};
