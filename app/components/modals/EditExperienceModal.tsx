import { useState } from 'react';
import { Experience } from '../../types/experience';
import { HiOutlinePlusCircle, HiOutlineX } from 'react-icons/hi';

interface EditExperienceModalProps {
  experience: Experience;
  onClose: () => void;
  onSave: (experience: Experience) => void;
}

export const EditExperienceModal = ({ experience, onClose, onSave }: EditExperienceModalProps) => {
  const [editedExperience, setEditedExperience] = useState<Experience>(experience);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedExperience);
  };

  const handleTechnologyChange = (index: number, value: string) => {
    const newTechnologies = [...editedExperience.technologies];
    newTechnologies[index] = value;
    setEditedExperience(prev => ({ ...prev, technologies: newTechnologies }));
  };

  const addTechnology = () => {
    setEditedExperience(prev => ({
      ...prev,
      technologies: [...prev.technologies, '']
    }));
  };

  const removeTechnology = (index: number) => {
    setEditedExperience(prev => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index)
    }));
  };

  const handleAchievementChange = (index: number, value: string) => {
    const newAchievements = [...editedExperience.achievements];
    newAchievements[index] = value;
    setEditedExperience(prev => ({ ...prev, achievements: newAchievements }));
  };

  const addAchievement = () => {
    setEditedExperience(prev => ({
      ...prev,
      achievements: [...prev.achievements, '']
    }));
  };

  const removeAchievement = (index: number) => {
    setEditedExperience(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-10">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-2xl w-full mx-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Modifier l'expérience</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Champs similaires à AddExperienceModal mais avec editedExperience au lieu de experience */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Titre</label>
            <input
              type="text"
              value={editedExperience.title}
              onChange={(e) => setEditedExperience(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-2 border rounded-lg text-gray-800 dark:text-white bg-white dark:bg-gray-700"
              required
            />
          </div>

          {/* ... autres champs ... */}

          <div className="flex gap-2 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 