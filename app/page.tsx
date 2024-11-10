'use client'

import { HiOutlineDocumentSearch , HiOutlineCog,HiDocumentAdd, HiOutlineAcademicCap } from "react-icons/hi";
import { HiOutlineEnvelope,HiOutlineWrenchScrewdriver,HiOutlineDocumentArrowUp   } from "react-icons/hi2";
import { FaLinkedin } from "react-icons/fa";
import { HiOutlineDocumentArrowDown } from "react-icons/hi2";
import { HiOutlineChartBar } from "react-icons/hi2";
import { HiOutlineCircleStack } from "react-icons/hi2";
import Image from 'next/image';
import { useState } from 'react';

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="w-full px-8 py-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm fixed top-0 z-50 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Amaury PICHAT</h1>
            <p className="text-gray-600 dark:text-gray-400">Consultant GED</p>
          </div>
          <div className="flex gap-6">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <HiOutlineCog className="text-xl" />
              Connexion
            </button>
            <a
              href="/path-to-your-cv.pdf"
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <HiOutlineDocumentArrowDown className="text-xl" />
              CV
            </a>
            <a
              href="https://www.linkedin.com/in/amaurypichat/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaLinkedin className="text-xl" />
              LinkedIn
            </a>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
            
            <h2 className="text-2xl font-bold mb-6">Connexion</h2>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="votre@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mot de passe
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Se connecter
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-32 px-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <section className="mb-20">
            <h2 className="text-4xl font-bold mb-6">Solutions GED sur mesure</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mb-4">
              Expert en gestion électronique des documents, j'accompagne les entreprises dans leur transformation numérique.
            </p>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <HiOutlineAcademicCap className="text-xl" />
              <p className="text-lg">
                Api et modèle de données documentum
                
              </p>
            </div>
          </section>

          {/* Services Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 
              transition-all duration-500 ease-out
              transform perspective-1000 hover:scale-105 hover:shadow-xl
              relative
              before:absolute before:inset-0 before:z-[-1] before:transition-all before:duration-500
              before:bg-gradient-to-r before:from-blue-50 before:to-blue-100 dark:before:from-blue-900/20 dark:before:to-blue-800/20
              before:opacity-0 hover:before:opacity-100 before:rounded-xl">
              <div className="text-blue-600 mb-4">
                <HiOutlineWrenchScrewdriver className="text-4xl" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Administration</h3>
              <p className="text-gray-600 dark:text-gray-400">Administration et maintenance de vos solutions GED</p>
            </div>
            
           
            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 
              transition-all duration-500 ease-out
              transform perspective-1000 hover:scale-105 hover:shadow-xl
              relative
              before:absolute before:inset-0 before:z-[-1] before:transition-all before:duration-500
              before:bg-gradient-to-r before:from-blue-50 before:to-blue-100 dark:before:from-blue-900/20 dark:before:to-blue-800/20
              before:opacity-0 hover:before:opacity-100 before:rounded-xl">
              <div className="text-blue-600 mb-4">
                <HiOutlineChartBar className="text-4xl" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Traitement de données</h3>
              <p className="text-gray-600 dark:text-gray-400">Analyse et traitement de vos données documentaires</p>
            </div>
            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 
              transition-all duration-500 ease-out
              transform perspective-1000 hover:scale-105 hover:shadow-xl
              relative
              before:absolute before:inset-0 before:z-[-1] before:transition-all before:duration-500
              before:bg-gradient-to-r before:from-blue-50 before:to-blue-100 dark:before:from-blue-900/20 dark:before:to-blue-800/20
              before:opacity-0 hover:before:opacity-100 before:rounded-xl">
              <div className="text-blue-600 mb-4">
                <HiOutlineDocumentArrowUp className="text-4xl" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Dématérialisation</h3>
              <p className="text-gray-600 dark:text-gray-400">Transformation de vos documents papier en données numériques</p>
            </div>
          </section>

          {/* Contact Section */}
          <section className="mb-20">
            <div className="p-8 rounded-xl bg-gray-100 dark:bg-gray-800">
              <h2 className="text-2xl font-bold mb-4">Démarrons votre projet</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Contactez-moi pour discuter de vos besoins en gestion documentaire.
              </p>
              <a
                href="mailto:amaury.pichat@gmail.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <HiOutlineEnvelope className="text-xl" />
                Me contacter
              </a>
            </div>
          </section>
        </div>
      </main>

      {/* Professional Experience Section */}
      <section id="experience" className="py-20 px-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">Expérience Professionnelle</h2>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <div className="flex flex-col md:flex-row justify-between mb-6">
              <div>
                <h3 className="text-2xl font-semibold mb-2">Administrateur National</h3>
                <div className="flex items-center gap-2">
                  <p className="text-xl text-blue-600 dark:text-blue-400">EDF et Coexya</p>
                  <Image 
                    src="/edf.png"
                    alt="Logo EDF"
                    width={30}
                    height={30}
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                <p>Villeurbanne - Lyon</p>
                <p>5 années</p>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <p className="">
                Développement et traitement de données en autonomie pour la GED du nucléaire
              </p>
              <p className="mb-6">
                <span className="text-blue-600 font-semibold">➜</span> 10 000 ingénieur du nucléaires, 8 millions de documents
              </p>

              <h4 className="text-lg font-semibold mb-4">Réalisations principales :</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Refonte majeure de la base documentaire : migration et restructuration de 4 millions de documents</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Pilotage du projet de dématérialisation : conversion de 100 000+ documents physiques en format numérique</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Développement d'une interface web moderne pour l'accès à la GED, améliorant l'expérience utilisateur</span>
                </li>
               
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Gestion de projet agile : Product Owner sur une application web stratégique, coordination d'une équipe de 4 développeurs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Accompagnement des utilisateurs lors du déploiement de nouvelles solutions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Gestion des incidents critiques : support niveau 2, résolution des problèmes complexes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Formation des autres administrateurs</span>
                </li>
              </ul>

              <h4 className="text-lg font-semibold mt-6 mb-4">Technologies et outils utilisés :</h4>
              <div className="flex flex-wrap gap-2">
                {['Documentum', 'VBA', 'Web (Js, React)', 'Python'].map((tech) => (
                  <span 
                    key={tech}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Formation Section */}
      <section id="formation" className="py-20 px-8 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">Formation</h2>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <div className="flex flex-col md:flex-row justify-between mb-6">
              <div>
                <h3 className="text-2xl font-semibold mb-2">Diplôme d'Ingénieur Généraliste</h3>
                <p className="text-xl text-blue-600 dark:text-blue-400 mb-2">ECAM Lyon</p>
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                <p>2017 - 2022</p>
                <p>Lyon</p>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <p className="mb-6">
                Formation d'ingénieur généraliste avec une spécialisation en informatique et systèmes d'information.
              </p>

              {/* <h4 className="text-lg font-semibold mb-4">Points clés :</h4>
              <ul className="space-y-3">
                <li>Formation pluridisciplinaire en sciences de l'ingénieur</li>
                <li>Spécialisation en informatique et systèmes d'information</li>
                <li>Projets pratiques et stages en entreprise</li>
              </ul> */}
            </div>
          </div>
        </div>
      </section>

      {/* Floating Menu */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <a 
          href="#experience" 
          className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 flex items-center gap-2 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
        >
          <HiOutlineDocumentSearch className="text-xl text-blue-600" />
          <span className="pr-2">Expérience</span>
        </a>
        <a 
          href="#formation" 
          className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 flex items-center gap-2 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
        >
          <HiOutlineAcademicCap className="text-xl text-blue-600" />
          <span className="pr-2">Formation</span>
        </a>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 py-8 px-8">
        <div className="max-w-6xl mx-auto text-center text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} Amaury PICHAT - Consultant GED
        </div>
      </footer>
    </div>
  );
}