'use client';

import { ThemeProvider } from './components/ThemeProvider';
import { Metadata } from 'next';
import localFont from "next/font/local";
import "./globals.css";

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

// export const metadata: Metadata = {
//   title: 'Amaury Pichat - Consultant GED',
//   description: 'Expert en gestion électronique de documents (GED) et solutions documentaires. Consultant indépendant spécialisé en OpenText Documentum.',
//   keywords: ['GED', 'Documentum', 'OpenText', 'consultant', 'gestion documentaire', 'ECM'],
//   authors: [{ name: 'Amaury Pichat' }],
//   creator: 'Amaury Pichat',
//   publisher: 'Amaury Pichat',
//   robots: 'index, follow',
//   icons: {
//     icon: '/icon.ico?v=3'
//   },
//   openGraph: {
//     type: 'website',
//     locale: 'fr_FR',
//     url: 'https://www.amaurypichat.fr',
//     siteName: 'Amaury Pichat - Consultant GED',
//     title: 'Amaury Pichat - Expert GED & Documentum',
//     description: 'Consultant indépendant spécialisé en solutions GED et Documentum',
//     // images: [
//     //   {
//     //     url: '/images/og-image.jpg', // Créez une image attractive pour les réseaux sociaux
//     //     width: 1200,
//     //     height: 630,
//     //     alt: 'Amaury Pichat - Consultant GED',
//     //   },
//     // ],
//   },
//   // twitter: {
//   //   card: 'summary_large_image',
//   //   title: 'Amaury Pichat - Expert GED & Documentum',
//   //   description: 'Consultant indépendant spécialisé en solutions GED et Documentum',
//   //   images: ['/images/og-image.jpg'],
//   // }
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <script
          // dangerouslySetInnerHTML={{
          //   __html: `
          //     try {
          //       if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          //         document.documentElement.classList.add('dark')
          //       } else {
          //         document.documentElement.classList.remove('dark')
          //       }
          //     } catch (_) {}
          //   `,
          // }}
        />
      </head>
      <body>
         <ThemeProvider> 
          {children}
         </ThemeProvider> 
      </body>
    </html>
  );
}
