"use client";

import React, { useState, useEffect } from 'react';
import PortfolioFooter from '@components/PortfolioFooter';

interface ContactData {
  contact: {
    email: string;
    phone: string;
    address: string;
    name: string;
    city: string;
    country: string;
    image_url: string;
    image_alt: string;
  };
}

const ContactPage: React.FC = () => {
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
  const [showDataLoadingIndicator, setShowDataLoadingIndicator] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const PROJECT_ID = process.env.NEXT_PUBLIC_ID_PROJET;

  useEffect(() => {
    const loadContactData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://dev2site.net:4000/api/texts?projectId=${PROJECT_ID}`);
        
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`);
        }

        const result = await response.json();
        
        if (result) {
          setContactData(result);
          console.log("Données contact:", result);
        } else {
          throw new Error('Aucune donnée de contact trouvée');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError(error instanceof Error ? error.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    loadContactData();
  }, [PROJECT_ID]);

  // Délai pour afficher l'indicateur de chargement seulement après 1 seconde
  useEffect(() => {
    if (!imageLoaded && contactData?.contact.image_url) {
      const timer = setTimeout(() => {
        setShowLoadingIndicator(true);
      }, 2000);

      return () => {
        clearTimeout(timer);
        setShowLoadingIndicator(false);
      };
    } else {
      setShowLoadingIndicator(false);
    }
  }, [imageLoaded, contactData]);

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

  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return '';
    
    // Ajouter un cache buster pour éviter les problèmes de cache
    return `${imageUrl}?v=${Date.now()}`;
  };

  if (loading && showDataLoadingIndicator) {
    return (
      // <div className="min-h-screen flex items-center justify-center">
      //   <div className="text-center">
      //     <div className="animate-pulse">
      //       <div className="h-4 bg-gray-300 rounded w-32 mx-auto"></div>
      //     </div>
      //     <p className="mt-4 text-gray-600">Chargement...</p>
      //   </div>
      // </div>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-exposure">Chargement...</p>
        </div>
      </div>
    );
  }

  if (loading && !showDataLoadingIndicator) {
    return <div className="min-h-screen bg-white w-full" aria-hidden="true" />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-customblue text-white rounded hover:bg-customblue"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!contactData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Données de contact non trouvées</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-exposure">
      {/* Indicateur de chargement d'image */}
      {showLoadingIndicator && !imageLoaded && contactData?.contact.image_url && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center">
            {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div> */}
            <p className="text-gray-600 font-exposure">Chargement...</p>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <section className={`flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full transition-opacity duration-500 ${!imageLoaded && contactData?.contact.image_url ? 'opacity-0' : 'opacity-100'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image à gauche */}
          <div className="order-2 lg:order-1">
            <div className="aspect-[4/3] bg-gray-900 rounded-lg overflow-hidden">
              {contactData.contact.image_url ? (
                <img
                  src={getImageUrl(contactData.contact.image_url)}
                  alt={contactData.contact.image_alt || 'Photo de contact'}
                  className="w-full h-full object-cover"
                  onLoad={() => {
                    console.log('Image chargée');
                    setImageLoaded(true);
                  }}
                  onError={(e) => {
                    console.error('Erreur de chargement image:', e);
                    setImageLoaded(true); // Afficher le contenu même en cas d'erreur
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">Image non disponible</p>
                </div>
              )}
            </div>
          </div>

          {/* Informations de contact à droite */}
          <div className="order-1 lg:order-2 space-y-8">
            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-8">
                {contactData.contact.name || 'Get In Touch'}
              </h2>
            </div>

            {/* Email */}
            {contactData.contact.email && (
              <div>
                <a
                  href={`mailto:${contactData.contact.email}`}
                  className="text-lg text-gray-700 hover:text-black transition-colors underline decoration-1 underline-offset-4"
                >
                  {contactData.contact.email}
                </a>
              </div>
            )}

            {/* Téléphone */}
            {contactData.contact.phone && (
              <div className="pt-4">
                <a 
                  href={`tel:${contactData.contact.phone.replace(/\s/g, '')}`}
                  className="text-lg text-gray-700 hover:text-black transition-colors"
                >
                  {contactData.contact.phone}
                </a>
              </div>
            )}

            {/* Adresse */}
            {(contactData.contact.address || contactData.contact.city || contactData.contact.country) && (
              <div className="pt-4 space-y-1">
                {contactData.contact.address && (
                  <p className="text-lg text-gray-700">{contactData.contact.address}</p>
                )}
                {contactData.contact.city && (
                  <p className="text-lg text-gray-700">{contactData.contact.city}</p>
                )}
                {contactData.contact.country && (
                  <p className="text-lg text-gray-700">{contactData.contact.country}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
      {/* Footer */}
      <PortfolioFooter />
    </div>
  );
};

export default ContactPage;
