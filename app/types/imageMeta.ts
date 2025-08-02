import { CategoryType, CATEGORY_VALUES } from './categories';

export interface ImageMeta {
  id: string;
  projet: string; // Ajout du champ projet
  image_url: string;
  position: number | Record<CategoryType, number>; // Position par catégorie ou position globale
  selected: boolean;
  category: CategoryType | CategoryType[]; // Support pour catégories multiples
  alt: string;
  titre: string; // Nouveau champ titre
  sousTitre: string; // Nouveau champ sous-titre
  dimension: [number, number]; // [width, height]
  crop?: {
    x: number;      // position X du cadre (en % de l'image originale)
    y: number;      // position Y du cadre (en % de l'image originale)
    size: number;   // taille du cadre (en %, 100% = plus petite dimension de l'image)
  };
  // Nouvelles données absolues pour un crop précis
  cropData?: {
    // Dimensions de l'image originale en pixels
    originalWidth: number;
    originalHeight: number;
    // Position et taille du crop en pixels absolus sur l'image originale
    cropX: number;        // position X en pixels sur l'image originale
    cropY: number;        // position Y en pixels sur l'image originale
    cropWidth: number;    // largeur du crop en pixels
    cropHeight: number;   // hauteur du crop en pixels
    // Ratio d'aspect souhaité pour l'affichage
    aspectRatio: number;  // width/height du format choisi (1, 2, 0.5)
  };
  // Garder displayDimensions pour compatibilité rétroactive
  displayDimensions?: {
    cropWidthPercent: number;
    cropHeightPercent: number;
  };
  created_at?: string;
  updated_at?: string;
}

// Fonctions utilitaires pour gérer les positions par catégorie
export const getPositionForCategory = (image: ImageMeta, category: CategoryType): number => {
  if (typeof image.position === 'number') {
    return image.position;
  }
  return image.position[category] || 0;
};

export const setPositionForCategory = (image: ImageMeta, category: CategoryType, position: number): ImageMeta => {
  let newPosition: number | Record<CategoryType, number>;
  
  if (typeof image.position === 'number') {
    // Convertir vers un objet avec toutes les catégories
    newPosition = CATEGORY_VALUES.reduce((acc, cat) => {
      acc[cat] = cat === category ? position : image.position as number;
      return acc;
    }, {} as Record<CategoryType, number>);
  } else {
    // Mettre à jour la catégorie spécifique
    newPosition = { ...image.position, [category]: position };
  }
  
  return { ...image, position: newPosition };
};

export const initializePositionsForAllCategories = (image: ImageMeta, defaultPosition: number = 0): ImageMeta => {
  if (typeof image.position === 'number') {
    const positions = CATEGORY_VALUES.reduce((acc, cat) => {
      acc[cat] = image.position as number;
      return acc;
    }, {} as Record<CategoryType, number>);
    return { ...image, position: positions };
  }
  return image;
};
