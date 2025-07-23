import { CategoryType } from './categories';

export interface ImageMeta {
  id: string;
  projet: string; // Ajout du champ projet
  image_url: string;
  position: number;
  selected: boolean;
  category: CategoryType;
  alt: string;
  titre: string; // Nouveau champ titre
  sousTitre: string; // Nouveau champ sous-titre
  dimension: [number, number]; // [width, height]
  created_at?: string;
  updated_at?: string;
}
