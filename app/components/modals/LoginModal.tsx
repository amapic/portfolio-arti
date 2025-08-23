import { useState } from 'react';
import { HiOutlineLockClosed, HiOutlineUser } from 'react-icons/hi2';

interface User {
  username: string;
  role: 'admin' | 'viewer';
}

interface LoginModalProps {
  onClose: () => void;
  onLogin: (success: boolean, userData?: User) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL_LOGIN;
const PROJECT_ID = process.env.NEXT_PUBLIC_ID_PROJET;

export const LoginModal = ({ onClose, onLogin }: LoginModalProps) => {
  const [userType, setUserType] = useState<'admin' | 'viewer'>('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/login?projectId=${PROJECT_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // credentials: 'include',
        body: JSON.stringify({ username: userType, password }),
      });

      if (!response.ok) {
        throw new Error('Identifiants incorrects');
      }

      const data = await response.json();
      const userData: User = {
        username: data.user.username,
        role: data.user.role
      };

      onLogin(true, userData);
      onClose();
    } catch (error) {
      setError('Identifiants incorrects');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          Connexion
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type de compte
            </label>
            <div className="relative">
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value as 'admin' | 'viewer')}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg 
                  bg-black text-white border-gray-300
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${error ? 'border-red-500' : 'border-gray-300'}`}
                required
              >
                <option value="admin">Administrateur</option>
                <option value="viewer">Viewer (Lecture seule)</option>
              </select>
              <HiOutlineUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg 
                  bg-black text-white border-gray-300
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${error ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Mot de passe"
                required
              />
              <HiOutlineLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg 
                hover:bg-gray-300 transition-colors
                dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg 
                hover:bg-blue-700 transition-colors
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 