import React from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider } from './components/SimpleAuthProvider';
import { ConditionalHeader } from './components/ConditionalHeader';
import type { Metadata } from 'next';
import "./globals.css";

export const metadata: Metadata = {
  title: 'Pierre Bazin - Photographe',
  description: 'Pierre Bazin - Photographe professionnel',
  keywords: ['photographie', 'photographe', 'Pierre Bazin'],
  authors: [{ name: 'Pierre Bazin' }],
  creator: 'Pierre Bazin',
  publisher: 'Pierre Bazin',
  robots: 'index, follow',
  icons: {
    icon: '/sgd.png?v=3'
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://dev2site.net',
    siteName: 'Pierre Bazin - Photographe',
    title: 'Pierre Bazin - Photographe',
    description: 'Pierre Bazin - Photographe professionnel',
    images: [
      {
        url: 'https://pierrebazin.fr/images/dev2site.jpg',
        width: 1200,
        height: 630,
        alt: 'Pierre Bazin - Photographe',
      },
    ],
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              })()
            `,
          }}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" type="image/x-icon" href="/sgd.png?v=3" />
      </head>
      <body>
        <AuthProvider>
          <ThemeProvider>
            <ConditionalHeader />
            <main className="pt-0">
              {children}
            </main>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
