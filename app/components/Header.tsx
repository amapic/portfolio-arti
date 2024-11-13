import { DarkModeToggle } from './DarkModeToggle';

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* ... autres éléments du header ... */}
        </div>
        
        <div className="flex items-center gap-4">
          <DarkModeToggle />
          {/* ... autres boutons du header ... */}
        </div>
      </div>
    </header>
  );
}; 