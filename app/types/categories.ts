// Types et constantes pour les catégories d'images

export type CategoryType = 'Theater' | 'Dance' | 'Opera' | 'Circus' | 'Event';

export interface Category {
  value: CategoryType;
  label: string;
  color: string; // Couleur pour l'affichage
}

export const CATEGORIES: Category[] = [
  { value: 'Theater', label: 'Théâtre', color: 'bg-red-100 text-red-800' },
  { value: 'Dance', label: 'Danse', color: 'bg-blue-100 text-blue-800' },
  { value: 'Opera', label: 'Opéra', color: 'bg-purple-100 text-purple-800' },
  { value: 'Circus', label: 'Cirque', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'Event', label: 'Événement', color: 'bg-green-100 text-green-800' }
];

export const CATEGORY_VALUES = CATEGORIES.map(cat => cat.value);

export const getCategoryLabel = (value: CategoryType): string => {
  return CATEGORIES.find(cat => cat.value === value)?.label || value;
};

export const getCategoryColor = (value: CategoryType): string => {
  return CATEGORIES.find(cat => cat.value === value)?.color || 'bg-gray-100 text-gray-800';
};
