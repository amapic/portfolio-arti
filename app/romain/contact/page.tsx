"use client";

import React, { useState, useEffect } from 'react';
import PortfolioHeader from '../../components/PortfolioHeader';
import PortfolioFooter from '../../components/PortfolioFooter';
import { TextData } from '../../types/text';

const ContactPage: React.FC = () => {
  const [contactData, setContactData] = useState<TextData | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const PROJECT_ID = process.env.NEXT_PUBLIC_ID_PROJET;

  useEffect(() => {
    const loadTextData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/texts?projectId=${PROJECT_ID}`);
        if (response.ok) {
          const data: TextData = await response.json();
          setContactData(data);
        } else {
          console.error('Erreur lors du chargement des données de texte');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données de texte:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTextData();
  }, [API_URL, PROJECT_ID]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  if (!contactData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Données de contact non trouvées</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <PortfolioHeader />

      {/* Contenu principal */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image à gauche */}
          <div className="order-2 lg:order-1">
            <div className="aspect-[4/3] bg-gray-900 rounded-lg overflow-hidden">
              <img
                src="/edf.png"
                alt="Romain de Lagarde - Contact"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Informations de contact à droite */}
          <div className="order-1 lg:order-2 space-y-8">
            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-8">
                Get In Touch
              </h2>
            </div>

            {/* Email */}
            <div>
              <a
                href={`mailto:${contactData.contact.email}`}
                className="text-lg text-gray-700 hover:text-black transition-colors underline decoration-1 underline-offset-4"
              >
                {contactData.contact.email}
              </a>
            </div>

            {/* Instagram */}
            <div>
              <a
                href="https://instagram.com/rdelagarde"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg text-gray-700 hover:text-black transition-colors underline decoration-1 underline-offset-4"
              >
                instagram.com/rdelagarde/
              </a>
            </div>

            {/* Téléphone */}
            <div className="pt-4">
              <a 
                href={`tel:${contactData.contact.phone.replace(/\s/g, '')}`}
                className="text-lg text-gray-700 hover:text-black transition-colors"
              >
                {contactData.contact.phone}
              </a>
            </div>

            {/* Adresse */}
            <div className="pt-4 space-y-1">
              <p className="text-lg text-gray-700">{contactData.contact.name}</p>
              <p className="text-lg text-gray-700">{contactData.contact.address}</p>
              <p className="text-lg text-gray-700">{contactData.contact.city}</p>
              <p className="text-lg text-gray-700">{contactData.contact.country}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <PortfolioFooter />
    </div>
  );
};

export default ContactPage;
