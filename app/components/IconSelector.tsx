import { useState } from 'react';
import * as Hi from 'react-icons/hi';
import * as Hi2 from 'react-icons/hi2';

type IconSelectorProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconName: string) => void;
}

export default function IconSelector({ isOpen, onClose, onSelect }: IconSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const allIcons = {
    ...Hi,
    ...Hi2
  };

  const filteredIcons = Object.entries(allIcons).filter(([name]) => 
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Sélectionner une icône</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-900 hover:text-black transition-colors"
          >
            <Hi.HiX className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Rechercher une icône..."
            className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-900 placeholder-gray-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-6 gap-4 overflow-y-auto p-4 bg-gray-100 rounded-lg">
          {filteredIcons.map(([name, Icon]) => (
            <button
              key={name}
              onClick={() => onSelect(name)}
              className="p-3 hover:bg-white rounded-lg flex flex-col items-center gap-2 transition-all hover:shadow-md bg-white border border-gray-300"
            >
              {/* @ts-ignore */}
              <Icon className="h-6 w-6 text-gray-900" />
              <span className="text-xs text-gray-900 font-semibold truncate w-full text-center">
                {name.replace(/^(Hi|Hi2)/, '')}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-300">
          <p className="text-sm text-gray-900 font-medium">
            {filteredIcons.length} icônes trouvées
          </p>
        </div>
      </div>
    </div>
  );
} 