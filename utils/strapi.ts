// Utilitaire pour les appels API Strapi
// utils/strapi.ts

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

export class StrapiAPI {
  static async get(endpoint: string, params?: Record<string, any>) {
    const url = new URL(`${STRAPI_URL}/api/${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }

  static async post(endpoint: string, data: any) {
    const response = await fetch(`${STRAPI_URL}/api/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  static async put(endpoint: string, data: any) {
    const response = await fetch(`${STRAPI_URL}/api/${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  static async delete(endpoint: string) {
    const response = await fetch(`${STRAPI_URL}/api/${endpoint}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }
}

// Exemples d'utilisation pour remplacer vos appels actuels :

// Avant (votre API Express)
// const images = await fetch('/api/images?projectId=3');

// Après (avec Strapi)
export const getImages = (projectId: string) => {
  return StrapiAPI.get('images', {
    'filters[projet][id][$eq]': projectId,
    'populate': '*'
  });
};

export const getTexts = (projectId: string) => {
  return StrapiAPI.get('text-contents', {
    'filters[projet][id][$eq]': projectId
  });
};

export const getExperiences = (projectId: string) => {
  return StrapiAPI.get('experiences', {
    'filters[projet][id][$eq]': projectId,
    'sort': 'position:asc'
  });
};
