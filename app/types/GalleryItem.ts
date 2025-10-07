export interface GalleryItem {
  id: string;
  category: string;
  categories: string[];
  imageUrl: string;
  alt: string;
  titre: string;
  sousTitre: string;
  dimension?: [number, number];
  crop?: {
    x: number;
    y: number;
    size: number;
  };
  displayDimensions?: {
    cropWidthPercent: number;
    cropHeightPercent: number;
  };
  cropData?: {
    originalWidth: number;
    originalHeight: number;
    cropX: number;
    cropY: number;
    cropWidth: number;
    cropHeight: number;
    aspectRatio: number;
  };
  isForcedSquare?: boolean;
  positions: {
    all: number;
    categoryLarge: number;
    categoryMedium: number;
    categorySmall: number;
  };
}