import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Suppression de 'output: export' pour le mode app complet
  // basePath: '/projets/demo',
  /* config options here */
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Supprime les erreurs d'hydration en production
  reactStrictMode: false,
  // Configuration pour les images externes Strapi
  images: {
    domains: ['46.101.250.41', 'dev2site.net'],
    // Suppression de 'unoptimized' pour profiter de l'optimisation Next.js
    formats: ['image/webp', 'image/avif'],
  },
  // generateRobotsTxt: false,
  // generateManifest: false
};

export default nextConfig;
