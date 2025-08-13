export interface ImageMeta {
  id: string;
  projet: string; // Ajout du champ projet
  image_url: string;
  position: number;
  selected: boolean;
  category: string | string[]; // Support pour catégories multiples (récupérées depuis l'API)
  alt: string;
  titre: string; // Nouveau champ titre
  sousTitre: string; // Nouveau champ sous-titre
  dimension: [number, number]; // [width, height]
  crop?: {
    x: number;      // position X du cadre (en %)
    y: number;      // position Y du cadre (en %)
    size: number;   // taille du cadre (en %, 100% = plus petite dimension de l'image)
  };
  displayDimensions?: {
    cropWidthPercent: number;
    cropHeightPercent: number;
  };
  created_at?: string;
  updated_at?: string;
}
