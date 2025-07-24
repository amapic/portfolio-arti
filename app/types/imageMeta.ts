import { CategoryType } from './categories';

export interface ImageMeta {
  id: string;
  projet: string; // Ajout du champ projet
  image_url: string;
  position: number;
  selected: boolean;
  category: CategoryType | CategoryType[]; // Support pour catégories multiples
  alt: string;
  titre: string; // Nouveau champ titre
  sousTitre: string; // Nouveau champ sous-titre
  dimension: [number, number]; // [width, height]
  crop?: {
    x: number;      // position X du cadre (en %)
    y: number;      // position Y du cadre (en %)
    width: number;  // largeur du cadre (en %)
    height: number; // hauteur du cadre (en %)
  };
  created_at?: string;
  updated_at?: string;
}
