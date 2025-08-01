export interface TextData {
  // Données de contact
  contact: {
    /** Titre de la section contact, p.ex. 'Get In Touch' */
    title?: string;
    email: string;
    phone: string;
    address: string;
    name: string;
    city: string;
    country: string;
    image_url: string;
    image_alt: string;
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
