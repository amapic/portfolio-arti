export interface AboutData {
  id?: string;
  projet: string;
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
  contact?: {
    email: string;
    phone: string;
    address: {
      name: string;
      street: string;
      city: string;
      country: string;
    };
    contactImage?: string;
  };
  footer?: {
    copyrightText?: string;
    designBy?: string;
    designUrl?: string;
    realisationBy?: string;
    realisationUrl?: string;
    mentionsLegalesUrl?: string;
  };

  created_at?: string;
  updated_at?: string;
}

// export interface AboutData {
//   // existing properties

  
// }