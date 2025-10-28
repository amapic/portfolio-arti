"use client";

import React, { useState, useEffect } from 'react';
import PortfolioFooter from '../components/PortfolioFooter';
import { TextData } from '../types/text';

const AboutPage: React.FC = () => {
  const [textData, setTextData] = useState<TextData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
  const [showDataLoadingIndicator, setShowDataLoadingIndicator] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const PROJECT_ID = process.env.NEXT_PUBLIC_ID_PROJET;

  useEffect(() => {
    const loadTextData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://dev2site.net:4000/api/texts?projectId=${PROJECT_ID}`);
        if (response.ok) {
          const data: TextData = await response.json();
          console.log("Données about API 4000:", data);
          setTextData(data);
        } else {
          console.error('Erreur lors du chargement des données');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTextData();
  }, [PROJECT_ID]);

  // Délai pour afficher l'indicateur de chargement seulement après 1 seconde
  useEffect(() => {
    if (!imageLoaded && textData?.about.image_url) {
      const timer = setTimeout(() => {
        setShowLoadingIndicator(true);
      }, 1000);

      return () => {
        clearTimeout(timer);
        setShowLoadingIndicator(false);
      };
    } else {
      setShowLoadingIndicator(false);
    }
  }, [imageLoaded, textData]);

  // Délai pour afficher l'indicateur de chargement des données après 1 seconde
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setShowDataLoadingIndicator(true);
      }, 1000);

      return () => {
        clearTimeout(timer);
        setShowDataLoadingIndicator(false);
      };
    } else {
      setShowDataLoadingIndicator(false);
    }
  }, [loading]);

  if (loading && showDataLoadingIndicator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-exposure">Chargement...</p>
        </div>
      </div>
    );
  }

  if (loading && !showDataLoadingIndicator) {
    // Chargement silencieux pendant la première seconde
    return null;
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
      {/* Indicateur de chargement d'image */}
      {showLoadingIndicator && !imageLoaded && textData?.about.image_url && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center">
            {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div> */}
            <p className="text-gray-600 font-exposure">Chargement...</p>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <section className={`py-16 px-4 sm:px-6 lg:px-8 transition-opacity duration-500 ${!imageLoaded && textData?.about.image_url ? 'opacity-0' : 'opacity-100'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Image à gauche */}
            <div className="w-full">
              {textData.about.image_url ? (
                <img
                  src={textData.about.image_url}
                  alt={textData.about.image_alt || 'Portrait'}
                  className="w-full h-auto object-cover rounded-lg shadow-lg"
                  onLoad={() => {
                    console.log('Image about chargée');
                    setImageLoaded(true);
                  }}
                  onError={(e) => {
                    console.error('Erreur de chargement image about:', e);
                    setImageLoaded(true); // Afficher le contenu même en cas d'erreur
                  }}
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 rounded-lg shadow-lg flex items-center justify-center">
                  <p className="text-gray-500">Image non disponible</p>
                </div>
              )}
            </div>

            {/* Contenu à droite */}
            <div className="space-y-8">
              {/* Texte principal */}
              {textData.about.main_text && (
                <div>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {textData.about.main_text}
                    </p>
                  </div>
                </div>
              )}

              {/* Citation */}
              {(textData.about.quote || textData.about.quote_author) && (
                <div className="border-l-4 border-gray-300 pl-6">
                  {textData.about.quote && (
                    <blockquote className="italic text-gray-600 text-lg">
                      "{textData.about.quote}"
                    </blockquote>
                  )}
                  {textData.about.quote_author && (
                    <cite className="text-gray-500 text-sm mt-2 block">
                      {textData.about.quote_author}
                    </cite>
                  )}
                </div>
              )}

              {/* Réseaux sociaux */}
              {(textData.about.links.instagram || textData.about.links.facebook || textData.about.links.linkedin) && (
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
              )}

              {/* Sites web */}
              {(textData.about.links.website1 || textData.about.links.website2) && (
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
                          {textData.about.links.website1.replace(/^https?:\/\//, '')}
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
                          {textData.about.links.website2.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
