export interface TextData {
  // Données de contact
  contact: {
    email: string;
    phone: string;
    address: string;
    name: string;
    city: string;
    country: string;
  };
  
  // Données de la page à propos
  about: {
    image_url: string;
    image_alt: string;
    main_text: string;
    quote: string;
    quote_author: string;
    links: {
      instagram: string;
      facebook: string;
      linkedin: string;
      website1: string;
      website2: string;
    };
  };
  
  // Métadonnées
  id?: string;
  projet: string;
  created_at?: string;
  updated_at?: string;
}
