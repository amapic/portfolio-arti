// Configuration Strapi pour votre projet
// utils/strapi-about.ts

const STRAPI_URL = 'https://dev2site.net:1337';

interface StrapiAboutData {
  id: number;
  attributes: {
    projet: string;
    mainText: string;
    quote: string;
    quoteAuthor: string;
    profileImage?: {
      data?: {
        attributes: {
          url: string;
          alternativeText?: string;
        }
      }
    };
    links: {
      instagram: string;
      facebook: string;
      linkedin: string;
      website1: string;
      website2: string;
    };
    createdAt: string;
    updatedAt: string;
  };
}

export class StrapiAboutAPI {
  // Récupérer les données About pour un projet
  static async getAbout(projectId: string): Promise<any> {
    try {
      const response = await fetch(
        `${STRAPI_URL}/api/abouts?filters[projet][$eq]=${projectId}&populate=*`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN || ''}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      
      // Strapi retourne un tableau, on prend le premier élément
      if (result.data && result.data.length > 0) {
        const strapiData = result.data[0];
        
        // Convertir au format attendu par votre frontend
        return {
          id: strapiData.id.toString(),
          projet: projectId,
          about: {
            image_url: strapiData.attributes.profileImage?.data?.attributes?.url || '',
            image_alt: strapiData.attributes.profileImage?.data?.attributes?.alternativeText || '',
            main_text: strapiData.attributes.mainText || '',
            quote: strapiData.attributes.quote || '',
            quote_author: strapiData.attributes.quoteAuthor || '',
            links: strapiData.attributes.links || {
              instagram: '',
              facebook: '',
              linkedin: '',
              website1: '',
              website2: ''
            }
          },
          created_at: strapiData.attributes.createdAt,
          updated_at: strapiData.attributes.updatedAt
        };
      }

      // Retourner des données par défaut si aucune donnée trouvée
      return {
        id: '',
        projet: projectId,
        about: {
          image_url: '',
          image_alt: '',
          main_text: '',
          quote: '',
          quote_author: '',
          links: {
            instagram: '',
            facebook: '',
            linkedin: '',
            website1: '',
            website2: ''
          }
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error fetching about data from Strapi:', error);
      throw error;
    }
  }

  // Mettre à jour les données About
  static async updateAbout(projectId: string, aboutData: any, imageFile?: File): Promise<any> {
    try {
      let imageUrl = aboutData.about.image_url;

      // Upload de l'image si fournie
      if (imageFile) {
        const uploadedImage = await this.uploadImage(imageFile);
        imageUrl = uploadedImage.url;
      }

      const strapiData = {
        data: {
          projet: projectId,
          mainText: aboutData.about.main_text,
          quote: aboutData.about.quote,
          quoteAuthor: aboutData.about.quote_author,
          links: aboutData.about.links,
          // L'image sera gérée séparément si c'est un upload
        }
      };

      // Vérifier si un enregistrement existe déjà
      const existingData = await this.getAbout(projectId);
      
      let response;
      if (existingData.id) {
        // Mise à jour
        response = await fetch(`${STRAPI_URL}/api/abouts/${existingData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN || ''}`,
          },
          body: JSON.stringify(strapiData),
        });
      } else {
        // Création
        response = await fetch(`${STRAPI_URL}/api/abouts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN || ''}`,
          },
          body: JSON.stringify(strapiData),
        });
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error updating about data in Strapi:', error);
      throw error;
    }
  }

  // Upload d'image vers Strapi
  static async uploadImage(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('files', file);

      const response = await fetch(`${STRAPI_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN || ''}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload Error: ${response.status}`);
      }

      const result = await response.json();
      return result[0]; // Strapi retourne un tableau
    } catch (error) {
      console.error('Error uploading image to Strapi:', error);
      throw error;
    }
  }
}
