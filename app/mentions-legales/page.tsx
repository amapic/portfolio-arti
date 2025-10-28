"use client";

import React from 'react';
import PortfolioFooter from '../components/PortfolioFooter';

export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-white">        
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Mentions légales</h1>
          
          <div className="prose prose-lg max-w-none">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Informations générales</h2>
            <p className="mb-6">
              Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance en l'économie numérique, 
              il est précisé aux utilisateurs du site l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">Éditeur du site</h3>
            <p className="mb-4">
              <strong>Pierre Bazin - Photographe</strong><br />
              <br />
              Adresse :1 rue Paul 69002 Lyon<br />
              Email : contact@pierrebazin.fr<br />
              Téléphone : 33 6 44 55 66 77
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">Hébergeur</h3>
            <p className="mb-4">
              Le site est hébergé par :<br />
              OVH SAS<br />
              2 rue Kellermann, 59100 Roubaix, France
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">Conception et réalisation</h3>
            <p className="mb-4">
              Site réalisé par <a href="https://dev2site.net" className="text-customblue hover:text-customblue underline">dev2site</a>
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-8">Propriété intellectuelle</h2>
            <p className="mb-6">
              L'ensemble du contenu du présent site Internet, notamment les textes, images, graphismes, logo, icônes, sons, logiciels, 
              est la propriété exclusive de Pierre Bazin ou de ses partenaires à l'exception des marques, logos ou contenus appartenant 
              à d'autres sociétés partenaires ou auteurs.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">Protection des données personnelles</h2>
            <p className="mb-6">
              Les informations recueillies sur ce site sont nécessaires pour traiter votre demande. Ces informations sont destinées 
              exclusivement à Pierre Bazin et ne seront en aucun cas transmises à des tiers.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">Cookies</h2>
            <p className="mb-6">
              Ce site utilise des cookies techniques nécessaires au bon fonctionnement du site. Ces cookies ne collectent aucune 
              donnée personnelle et ne nécessitent pas de consentement.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact</h2>
            <p className="mb-6">
              Pour toute question concernant ces mentions légales, vous pouvez nous contacter à l'adresse : contact@pierrebazin.fr
            </p>
          </div>
        </div>
      </main>

      <PortfolioFooter />
    </div>
  );
}