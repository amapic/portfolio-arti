import { useState } from 'react';
import { HiOutlinePlusCircle, HiOutlineX } from 'react-icons/hi';

export const AddExperienceModal = ({ onClose, onAdd }) => {
  const [experience, setExperience] = useState({
    title: '',
    company: '',
    logoUrl: '',
    location: '',
    duration: '',
    description: '',
    highlight: '',
    achievements: [''],
    technologies: ['']
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(experience);
  };

  const handleTechnologyChange = (index, value) => {
    const newTechnologies = [...experience.technologies];
    newTechnologies[index] = value;
    setExperience(prev => ({ ...prev, technologies: newTechnologies }));
  };

  const addTechnology = () => {
    setExperience(prev => ({ ...prev, technologies: [...prev.technologies, ''] }));
  };

  const removeTechnology = (index) => {
    const newTechnologies = experience.technologies.filter((_, i) => i !== index);
    setExperience(prev => ({ ...prev, technologies: newTechnologies }));
  };

  const handleAchievementChange = (index: number, value: string) => {
    const newAchievements = [...experience.achievements];
    newAchievements[index] = value;
    setExperience(prev => ({ ...prev, achievements: newAchievements }));
  };

  const addAchievement = () => {
    setExperience(prev => ({ ...prev, achievements: [...prev.achievements, ''] }));
  };

  const removeAchievement = (index: number) => {
    const newAchievements = experience.achievements.filter((_, i) => i !== index);
    setExperience(prev => ({ ...prev, achievements: newAchievements }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-10">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-2xl w-full mx-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Ajouter une expérience</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Titre</label>
            <input
              type="text"
              value={experience.title}
              onChange={(e) => setExperience(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-2 border rounded-lg text-gray-800 dark:text-white bg-white dark:bg-gray-700"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Entreprise</label>
            <input
              type="text"
              value={experience.company}
              onChange={(e) => setExperience(prev => ({ ...prev, company: e.target.value }))}
              className="w-full p-2 border rounded-lg text-gray-800 dark:text-white bg-white dark:bg-gray-700"
              // required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">URL du logo</label>
            <input
              type="text"
              value={experience.logoUrl}
              onChange={(e) => setExperience(prev => ({ ...prev, logoUrl: e.target.value }))}
              className="w-full p-2 border rounded-lg text-gray-800 dark:text-white bg-white dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Lieu</label>
            <input
              type="text"
              value={experience.location}
              onChange={(e) => setExperience(prev => ({ ...prev, location: e.target.value }))}
              className="w-full p-2 border rounded-lg text-gray-800 dark:text-white bg-white dark:bg-gray-700"
              // required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Durée</label>
            <input
              type="text"
              value={experience.duration}
              onChange={(e) => setExperience(prev => ({ ...prev, duration: e.target.value }))}
              className="w-full p-2 border rounded-lg text-gray-800 dark:text-white bg-white dark:bg-gray-700"
              // required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              value={experience.description}
              onChange={(e) => setExperience(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-2 border rounded-lg text-gray-800 dark:text-white bg-white dark:bg-gray-700"
              rows="3"
              // required
            ></textarea>
          </div>

          

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Point fort</label>
            <input
              type="text"
              value={experience.highlight}
              onChange={(e) => setExperience(prev => ({ ...prev, highlight: e.target.value }))}
              className="w-full p-2 border rounded-lg text-gray-800 dark:text-white bg-white dark:bg-gray-700"
              // required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Réalisations</label>
            {experience.achievements.map((achievement, index) => (
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

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Technologies</label>
            {experience.technologies.map((tech, index) => (
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
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 