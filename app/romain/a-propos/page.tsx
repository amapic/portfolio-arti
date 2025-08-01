"use client";

import React, { useState, useEffect } from 'react';
import PortfolioHeader from '../../components/PortfolioHeader';
import PortfolioFooter from '../../components/PortfolioFooter';
import { TextData } from '../../types/text';
type PortfolioHeaderProps = {
  title: string;
  currentPage: string;
};
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


  // Don't render until textData is loaded
  if (!textData) return null;
  // Do not render until textData is loaded
  if (!textData) return null;
  return (
    <div className="min-h-screen bg-white font-exposure">
      {/* Header */}
      <PortfolioHeader 
        title="Romain de Lagarde"
        currentPage="about"
        showHome={true}
      />
      {/* Contenu principal */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
            
            {/* Image à gauche (1/3) */}
            <div className="w-full lg:col-span-1">
              <img
                src={textData.about.image_url}
                alt={textData.about.image_alt}
                className="w-full h-auto object-cover rounded-lg shadow-lg"
              />
            </div>

            {/* Contenu à droite (2/3) */}
            <div className="space-y-8 lg:col-span-2">
              {/* Texte principal */}
              <div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {textData.about.main_text}
                  </p>
                </div>
              </div>

              {/* Citation centered with dividers */}
              <hr className="border-t border-gray-600 my-6" />
              <div className="mx-auto max-w-2xl text-right">
                <blockquote className="italic text-gray-600 text-lg">
                  "{textData.about.quote}"
                </blockquote>
                <div className="mt-2 text-gray-600 text-sm">
                  {textData.about.quote_author}
                </div>
              </div>
              {/* <hr className="border-t border-gray-300 my-6" /> */}

            </div>
          </div>
        </div>
      </section>

      {/* Social and Website links below grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="pt-8">
            <ul className="list-none space-y-1 text-gray-600">
              {textData.about.links.instagram && (
                <li>
                  <a href={textData.about.links.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors underline decoration-1 underline-offset-4">
                    Instagram
                  </a>
                </li>
              )}
              {textData.about.links.facebook && (
                <li>
                  <a href={textData.about.links.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors underline decoration-1 underline-offset-4">
                    Facebook
                  </a>
                </li>
              )}
              {textData.about.links.linkedin && (
                <li>
                  <a href={textData.about.links.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors underline decoration-1 underline-offset-4">
                    LinkedIn
                  </a>
                </li>
              )}
              {textData.about.links.website1 && (
                <li>
                  <a href={textData.about.links.website1} target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors underline decoration-1 underline-offset-4">
                    {textData.about.links.website1.replace('https://', '')}
                  </a>
                </li>
              )}
              {textData.about.links.website2 && (
                <li>
                  <a href={textData.about.links.website2} target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors underline decoration-1 underline-offset-4">
                    {textData.about.links.website2.replace('https://', '')}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <PortfolioFooter />
    </div>
  );
};

export default AboutPage;
