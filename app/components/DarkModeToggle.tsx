import { useEffect, useState } from 'react';
import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi2';

export const DarkModeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Vérifie la préférence initiale
    if (typeof window !== 'undefined') {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    }
  }, []);

  const toggleDarkMode = () => {
    
    if (document.documentElement.classList.contains('dark')) {
      document.body.style.setProperty('--foreground', '#444444');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      document.body.style.setProperty('--foreground', '#ededed');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 
        hover:bg-gray-200 dark:hover:bg-gray-700 
        transition-colors duration-200"
      aria-label={isDarkMode ? 'Activer le mode clair' : 'Activer le mode sombre'}
    >
      {isDarkMode ? (
        <HiOutlineSun className="w-5 h-5 text-yellow-500" />
      ) : (
        <HiOutlineMoon className="w-5 h-5 text-gray-600" />
      )}
    </button>
  );
}; 