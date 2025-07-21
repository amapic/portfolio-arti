'use client'

import { useEffect } from 'react';

// Script à injecter dans le head
const themeScript = `
  (function() {
    // Récupère le thème stocké ou utilise la préférence système
    const theme = localStorage.getItem('theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    // Applique la classe dark si nécessaire
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    
    // Écoute les changements de préférence système
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    });
  })()
`;

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Injecte le script dans le head
    const scriptElement = document.createElement('script');
    scriptElement.innerHTML = themeScript;
    document.head.appendChild(scriptElement);

    return () => {
      document.head.removeChild(scriptElement);
    };
  }, []);

  return <>{children}</>;
}; 