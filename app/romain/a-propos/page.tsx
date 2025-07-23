"use client";

import React, { useState, useEffect } from 'react';
import PortfolioHeader from '../../components/PortfolioHeader';
import PortfolioFooter from '../../components/PortfolioFooter';
import { AboutData } from '../../types/about';

const AProposPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const PROJECT_ID = process.env.NEXT_PUBLIC_ID_PROJET;

  const [aboutData, setAboutData] = useState<AboutData>({
    projet: PROJECT_ID || '1',
    image_url: "/placeholder-portrait.jpg",
    image_alt: "Portrait de Romain de Lagarde",
    main_text: `Refléter, éblouir, éteindre, estomper, suggérer, diffracter, découper, briller, brouiller : la lumière est l'outil qui me permet de sculpter un volume, une expression artistique, dans un dialogue attentif et continu avec ses utilisations : scénographie, chorégraphie, danse, théâtre, musique et chant mais aussi installation événementielle, espace public et habitat.

Depuis 2007, pour chacun des projets qui me sont confiés, je m'interroge avec empathie et sensibilité sur le langage propre de la lumière, sur la façon dont elle interagit avec nos sens et notre perception de l'espace ou encore comment elle influence notre imagination, nos souvenirs vécus, comment elle sublime et singularise notre environnement pour nous conduire à un émerveillement et provoquer une émotion.`,
    quote: "Le monde y recommençait tous les jours dans une lumière toujours neuve. Ô lumière ! C'est le cri de tous les personnages placés (...) devant leur destin.",
    quote_author: "Albert Camus, L'été.",
    links: {
      instagram: "https://instagram.com/romain.delagarde",
      facebook: "https://facebook.com/romain.delagarde",
      linkedin: "https://linkedin.com/in/romain-delagarde",
      website1: "https://lesarchivesduspectacle.net",
      website2: "https://theatre-contemporain.net"
    }
  });

  // Charger les données depuis l'API
  useEffect(() => {
    const loadAboutData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/about?projectId=${PROJECT_ID}`);
        if (response.ok) {
          const data = await response.json();
          setAboutData(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données à propos:', error);
      } finally {
        setLoading(false);
      }
    };

    if (API_URL && PROJECT_ID) {
      loadAboutData();
    } else {
      setLoading(false);
    }
  }, [API_URL, PROJECT_ID]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-serif p-0 m-0">
        <PortfolioHeader />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <span className="ml-4 text-black opacity-70">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-serif p-0 m-0">
      <PortfolioHeader />
      
      {/* Section principale avec image et texte */}
      <section className="max-w-6xl mx-auto px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Image à gauche */}
          <div className="lg:w-1/3 flex-shrink-0">
            <div className="bg-black p-4 shadow-2xl">
              <img
                src={aboutData.image_url}
                alt={aboutData.image_alt}
                className="w-full h-auto"
                style={{ aspectRatio: '3/4' }}
              />
            </div>
          </div>

          {/* Texte à droite */}
          <div className="lg:w-2/3 space-y-6">
            <div className="text-gray-700 text-lg leading-relaxed font-light">
              {aboutData.main_text.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-6">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section citation */}
      <section className="max-w-4xl mx-auto px-8 py-8">
        <div className="border-t border-gray-300 pt-8">
          <blockquote className="text-center italic text-gray-600 text-lg leading-relaxed">
            <p className="mb-4">
              "{aboutData.quote}"
            </p>
            <cite className="text-sm font-medium text-gray-800 not-italic">
              {aboutData.quote_author}
            </cite>
          </blockquote>
        </div>
      </section>

      {/* Section liens */}
      <section className="max-w-4xl mx-auto px-8 py-12">
        <div className="space-y-6">
          <h3 className="text-xl font-medium text-gray-800 mb-6">Liens</h3>
          
          {/* Réseaux sociaux */}
          <div className="space-y-2">
            <h4 className="text-lg font-light text-gray-700 mb-3">Réseaux sociaux</h4>
            <div className="space-y-1">
              {aboutData.links.instagram && (
                <div>
                  <a 
                    href={aboutData.links.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-black transition-colors underline decoration-1 underline-offset-4"
                  >
                    Profil Instagram
                  </a>
                </div>
              )}
              
              {aboutData.links.facebook && (
                <div>
                  <a 
                    href={aboutData.links.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-black transition-colors underline decoration-1 underline-offset-4"
                  >
                    Profil Facebook
                  </a>
                </div>
              )}
              
              {aboutData.links.linkedin && (
                <div>
                  <a 
                    href={aboutData.links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-black transition-colors underline decoration-1 underline-offset-4"
                  >
                    Profil LinkedIn
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Sites web */}
          <div className="space-y-2 pt-4">
            <h4 className="text-lg font-light text-gray-700 mb-3">Sites web</h4>
            <div className="space-y-1">
              {aboutData.links.website1 && (
                <div>
                  <a 
                    href={aboutData.links.website1}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-black transition-colors underline decoration-1 underline-offset-4"
                  >
                    {aboutData.links.website1.replace('https://', '')}
                  </a>
                </div>
              )}
              
              {aboutData.links.website2 && (
                <div>
                  <a 
                    href={aboutData.links.website2}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-black transition-colors underline decoration-1 underline-offset-4"
                  >
                    {aboutData.links.website2.replace('https://', '')}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <PortfolioFooter aboutData={aboutData} />
    </div>
  );
};

export default AProposPage;
