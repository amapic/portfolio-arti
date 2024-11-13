import Image from 'next/image';
import { Experience } from '../../types/experience';
import { HiOutlinePlusCircle, HiOutlineTrash, HiOutlinePencil } from 'react-icons/hi2';

interface ExperienceSectionProps {
  experiences: Experience[];
  isLoggedIn: boolean;
  onDelete: (id: string) => void;
  onAdd: () => void;
  setExperienceToEdit: (experience: Experience | null) => void;
  setIsEditingExperience: (isEditing: boolean) => void;
}

export const ExperienceSection = ({ experiences, isLoggedIn, onDelete, onAdd, setExperienceToEdit,setIsEditingExperience }: ExperienceSectionProps) => {
  return (
    <section id="experience" className="py-20 px-8 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-12">Expérience Professionnelle</h2>
        
        <div className="space-y-8">
          {experiences.map((experience) => (
            <div key={experience.id} className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg relative">
              {/* {isLoggedIn && (
                <button
                  onClick={() => onDelete(experience.id)}
                  className="absolute top-4 right-4 p-2 text-red-500
                    transition-colors hover:text-red-700 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"
                  aria-label="Supprimer l'expérience"
                >
                  <HiOutlineTrash className="w-5 h-5" />
                </button>
              )} */}

              <div className="flex flex-col md:flex-row justify-between mb-6">
                <div>
                  <div className="flex items-center">
                    <h3 className="text-2xl font-semibold mb-2">{experience.title}</h3>
                    {isLoggedIn && (
                      <>
                        <button
                          onClick={() => {
                            setExperienceToEdit(experience);
                            setIsEditingExperience(true);
                          }}
                          className="ml-2 p-2 text-blue-500 transition-colors hover:text-blue-700 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50"
                          aria-label="Éditer l'expérience"
                        >
                          <HiOutlinePencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => onDelete(experience.id)}
                          className="ml-2 p-2 text-red-500 transition-colors hover:text-red-700 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"
                          aria-label="Supprimer l'expérience"
                        >
                          <HiOutlineTrash className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xl text-blue-600 dark:text-blue-400">{experience.company}</p>
                    {/* {experience.logoUrl && (
                      <Image 
                        src={experience.logoUrl}
                        alt={`Logo ${experience.company}`}
                        width={30}
                        height={30}
                        className="object-contain"
                      />
                    )} */}
                  </div>
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  <p>{experience.location}</p>
                  <p>{experience.duration}</p>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <p>{experience.description}</p>
                <p className="mb-6">
                  <span className="text-blue-600 font-semibold">➜</span> {experience.highlight}
                </p>

                <h4 className="text-lg font-semibold mb-4">Réalisations principales :</h4>
                <ul className="space-y-3">
                  {experience.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{achievement}</span>
                    </li>
                  ))}
                </ul>

                <h4 className="text-lg font-semibold mt-6 mb-4">Technologies et outils utilisés :</h4>
                <div className="flex flex-wrap gap-2">
                  {experience.technologies.map((tech) => (
                    <span 
                      key={tech}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {isLoggedIn && (
            <button
              onClick={onAdd}
              className="w-full p-8 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600
                hover:border-blue-500 dark:hover:border-blue-500
                transition-colors flex flex-col items-center justify-center gap-4
                text-gray-500 dark:text-gray-400 hover:text-blue-500"
            >
              <HiOutlinePlusCircle className="text-4xl" />
              <span>Ajouter une expérience</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}; 