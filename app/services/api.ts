import { Card } from '../types/card';
import { Experience } from '../types/experience';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const defaultHeaders = {
  'Content-Type': 'application/json',
};

const fetchConfig = {
  // mode: 'no-cors' as RequestMode,
  headers: defaultHeaders,
};

export const api = {
  // ... méthodes existantes pour les cards ...

  experiences: {
    getAll: async (): Promise<Experience[]> => {
      const response = await fetch(`${API_URL}/api/experiences`, {
        ...fetchConfig,
        method: 'GET',
      });
      if (!response.ok) throw new Error('Failed to fetch experiences');
      return response.json();
    },

    add: async (experience: Omit<Experience, 'id'>): Promise<Experience> => {
      console.log(experience)
      const response = await fetch(`${API_URL}/api/experiences`, {
        ...fetchConfig,
        method: 'POST',
        body: JSON.stringify(experience),
      });
      if (!response.ok) throw new Error('Failed to add experience');
      return response.json();
    },

    delete: async (id: string): Promise<void> => {
      alert("rr")
      const response = await fetch(`${API_URL}/api/experiences/${id}`, {
        ...fetchConfig,
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete experience');
    }
  }
}; 