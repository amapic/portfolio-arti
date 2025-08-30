"use client";

import React, { useState, useEffect } from 'react';
import PortfolioHeader from '../components/PortfolioHeader';
import PortfolioFooter from '../components/PortfolioFooter';
import { TextData } from '../types/text';

const AboutPage: React.FC = () => {
  const [textData, setTextData] = useState<TextData | null>(null);
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
          setTextData(data);
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
        <div className="text-center">
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!textData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Erreur lors du chargement des données</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <PortfolioHeader 
        title="Pierre Besson"
        showNavigation={true}
      />

      {/* Contenu principal */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Image à gauche */}
            <div className="w-full">
              <img
                src={textData.about.image_url}
                alt={textData.about.image_alt}
                className="w-full h-auto object-cover rounded-lg shadow-lg"
              />
            </div>

            {/* Contenu à droite */}
            <div className="space-y-8">
              {/* Texte principal */}
              <div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {textData.about.main_text}
                  </p>
                </div>
              </div>

              {/* Citation */}
              <div className="border-l-4 border-gray-300 pl-6">
                <blockquote className="italic text-gray-600 text-lg">
                  "{textData.about.quote}"
                </blockquote>
                <cite className="text-gray-500 text-sm mt-2 block">
                  {textData.about.quote_author}
                </cite>
              </div>

              {/* Réseaux sociaux */}
              <div className="space-y-2 pt-4">
                <h4 className="text-lg font-light text-gray-700 mb-3">Réseaux sociaux</h4>
                <div className="flex gap-4">
                  {textData.about.links.instagram && (
                    <a 
                      href={textData.about.links.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-black transition-colors underline decoration-1 underline-offset-4"
                    >
                      Instagram
                    </a>
                  )}
                  
                  {textData.about.links.facebook && (
                    <a 
                      href={textData.about.links.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-black transition-colors underline decoration-1 underline-offset-4"
                    >
                      Facebook
                    </a>
                  )}
                  
                  {textData.about.links.linkedin && (
                    <a 
                      href={textData.about.links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-black transition-colors underline decoration-1 underline-offset-4"
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>

              {/* Sites web */}
              <div className="space-y-2 pt-4">
                <h4 className="text-lg font-light text-gray-700 mb-3">Sites web</h4>
                <div className="space-y-1">
                  {textData.about.links.website1 && (
                    <div>
                      <a 
                        href={textData.about.links.website1}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-black transition-colors underline decoration-1 underline-offset-4"
                      >
                        {textData.about.links.website1.replace('https://', '')}
                      </a>
                    </div>
                  )}
                  
                  {textData.about.links.website2 && (
                    <div>
                      <a 
                        href={textData.about.links.website2}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-black transition-colors underline decoration-1 underline-offset-4"
                      >
                        {textData.about.links.website2.replace('https://', '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <PortfolioFooter />
    </div>
  );
};

export default AboutPage;
