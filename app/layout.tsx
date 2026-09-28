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
        <link rel="preload" href="/ExposureTrial-0.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try {
                  if (document && document.fonts && document.fonts.load) {
                    document.fonts.load('1rem "ExposureTrial"').then(function(){
                      document.documentElement.classList.add('exposure-loaded');
                    }).catch(function(){
                      document.documentElement.classList.add('exposure-loaded');
                    });
                  } else {
                    // Fallback: mark loaded after short delay
                    setTimeout(function(){
                      document.documentElement.classList.add('exposure-loaded');
                    }, 300);
                  }
                } catch(e) {
                  try { document.documentElement.classList.add('exposure-loaded'); } catch(_){}
                }
              })();
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
