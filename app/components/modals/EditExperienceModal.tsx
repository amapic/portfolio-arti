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

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Entreprise</label>
            <input
              type="text"
              value={editedExperience.company}
              onChange={(e) => setEditedExperience(prev => ({ ...prev, company: e.target.value }))}
              className="w-full p-2 border rounded-lg text-gray-800 dark:text-white bg-white dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">URL du logo</label>
            <input
              type="text"
              value={editedExperience.logoUrl}
              onChange={(e) => setEditedExperience(prev => ({ ...prev, logoUrl: e.target.value }))}
              className="w-full p-2 border rounded-lg text-gray-800 dark:text-white bg-white dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Lieu</label>
            <input
              type="text"
              value={editedExperience.location}
              onChange={(e) => setEditedExperience(prev => ({ ...prev, location: e.target.value }))}
              className="w-full p-2 border rounded-lg text-gray-800 dark:text-white bg-white dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Durée</label>
            <input
              type="text"
              value={editedExperience.duration}
              onChange={(e) => setEditedExperience(prev => ({ ...prev, duration: e.target.value }))}
              className="w-full p-2 border rounded-lg text-gray-800 dark:text-white bg-white dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              value={editedExperience.description}
              onChange={(e) => setEditedExperience(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-2 border rounded-lg text-gray-800 dark:text-white bg-white dark:bg-gray-700"
              rows={3}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Point fort</label>
            <input
              type="text"
              value={editedExperience.highlight}
              onChange={(e) => setEditedExperience(prev => ({ ...prev, highlight: e.target.value }))}
              className="w-full p-2 border rounded-lg text-gray-800 dark:text-white bg-white dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Technologies</label>
            {editedExperience.technologies.map((tech, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={tech}
                  onChange={(e) => handleTechnologyChange(index, e.target.value)}
                  className="flex-grow p-2 border rounded-lg text-gray-800 dark:text-white bg-white dark:bg-gray-700"
                  placeholder="Entrez une technologie"
                />
                <button
                  type="button"
                  onClick={() => removeTechnology(index)}
                  className="ml-2 p-2 text-red-500 hover:text-red-700"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addTechnology}
              className="mt-2 flex items-center text-blue-500 hover:text-blue-700"
            >
              <HiOutlinePlusCircle className="w-5 h-5 mr-1" />
              Ajouter une technologie
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Réalisations</label>
            {editedExperience.achievements.map((achievement, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={achievement}
                  onChange={(e) => handleAchievementChange(index, e.target.value)}
                  className="flex-grow p-2 border rounded-lg text-gray-800 dark:text-white bg-white dark:bg-gray-700"
                  placeholder="Entrez une réalisation"
                />
                <button
                  type="button"
                  onClick={() => removeAchievement(index)}
                  className="ml-2 p-2 text-red-500 hover:text-red-700"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addAchievement}
              className="mt-2 flex items-center text-blue-500 hover:text-blue-700"
            >
              <HiOutlinePlusCircle className="w-5 h-5 mr-1" />
              Ajouter une réalisation
            </button>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
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