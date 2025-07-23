"use client";

import React, { useState, useEffect } from 'react';
import { TextData } from '../../types/text';

const TextAdmin: React.FC = () => {
  const [contactData, setContactData] = useState<TextData>({
    id: '',
    projet: '3',
    type: 'contact',
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const PROJECT_ID = process.env.NEXT_PUBLIC_ID_PROJET;

  // Charger les données existantes
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/texts?projectId=${PROJECT_ID}`);
        if (response.ok) {
          const data = await response.json();
          if (data.contact) {
            setContactData(data.contact);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        setMessage('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [API_URL, PROJECT_ID]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');

      const response = await fetch(`${API_URL}/api/texts?projectId=${PROJECT_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: 'contact',
          value: {
            ...contactData,
            updated_at: new Date().toISOString()
          }
        }),
      });

      if (response.ok) {
        setMessage('Contact sauvegardé avec succès !');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Administration - Contact</h1>
            <p className="text-gray-600 mt-2">Gérer les informations de contact</p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-md ${
              message.includes('succès') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="space-y-6">
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet
              </label>
              <input
                type="text"
                value={contactData.nom || ''}
                onChange={(e) => setContactData(prev => ({ ...prev, nom: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Romain de Lagarde"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email de contact
              </label>
              <input
                type="email"
                value={contactData.email || ''}
                onChange={(e) => setContactData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="contact@romaindelagarde.fr"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={contactData.telephone || ''}
                onChange={(e) => setContactData(prev => ({ ...prev, telephone: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+336 22 42 23 32"
              />
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse postale
              </label>
              <textarea
                rows={4}
                value={contactData.adresse || ''}
                onChange={(e) => setContactData(prev => ({ ...prev, adresse: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1 rue Dumont d'Urville&#10;69004 - Lyon&#10;France"
              />
            </div>

            {/* Bouton de sauvegarde */}
            <div className="pt-6 border-t">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextAdmin;
