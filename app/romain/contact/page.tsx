"use client";

import React, { useState, useEffect } from 'react';
import PortfolioHeader from '../../components/PortfolioHeader';
import { TextData } from '../../types/text';
import PortfolioFooter from '../../components/PortfolioFooter';
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


  // Do not render until contactData is loaded
  if (!contactData) return null;
  return (
    <div className="min-h-screen bg-white flex flex-col font-exposure">
      {/* Header */}
      <PortfolioHeader 
        title="Romain de Lagarde"
        showNavigation={true}
      />

      {/* Contenu principal */}
      <section className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-center w-full">
          {/* Image à gauche (2/3) */}
          <div className="order-2 lg:order-1 lg:col-span-2">
            <div className="aspect-[4/3] bg-gray-900 rounded-lg overflow-hidden">
              <img
                src={contactData!.contact.image_url}
                alt={contactData!.contact.image_alt}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Informations de contact à droite (1/3) */}
          <div className="order-1 lg:order-2 lg:col-span-1 space-y-8">
            <div>
            <h2 className="text-2xl font-light text-gray-900 mb-8">
              {contactData!.contact.title || 'Get In Touch'}
            </h2>
            </div>

            {/* Email */}
            <div>
              <a
                href={`mailto:${contactData!.contact.email}`}
                className="text-lg text-gray-700 hover:text-black transition-colors underline decoration-1 underline-offset-4"
              >
                {contactData!.contact.email}
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
                href={`tel:${contactData!.contact.phone.replace(/\s/g, '')}`}
                className="text-lg text-gray-700 hover:text-black transition-colors"
              >
                {contactData!.contact.phone}
              </a>
            </div>

            {/* Adresse */}
            <div className="pt-4 space-y-1">
              <p className="text-lg text-gray-700">{contactData!.contact.name}</p>
              <p className="text-lg text-gray-700">{contactData!.contact.address}</p>
              <p className="text-lg text-gray-700">{contactData!.contact.city}</p>
              <p className="text-lg text-gray-700">{contactData!.contact.country}</p>
            </div>
          </div>
        </div>
      </section>
      <PortfolioFooter />
    </div>
  );
};

export default ContactPage;
