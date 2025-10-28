import { HiOutlineCheck, HiOutlineX, HiOutlineEnvelope, HiOutlinePencil } from "react-icons/hi2";

interface ContactSectionProps {
  texts: {
    contactEmail: string;
  };
  isLoggedIn: boolean;
  editingStates: {
    contactEmail: boolean;
  };
  titleError: string;
  MAX_LENGTHS: {
    contactEmail: number;
  };
  handleTextUpdate: (key: string, value: string) => void;
  toggleEditing: (field: string, value: boolean) => void;
  setTexts: (callback: (prev: any) => any) => void;
  setTitleError: (error: string) => void;
}

export const ContactSection = ({
  texts,
  isLoggedIn,
  editingStates,
  titleError,
  MAX_LENGTHS,
  handleTextUpdate,
  toggleEditing,
  setTexts,
  setTitleError,
}: ContactSectionProps) => {
  return (
    <section className="mb-20">
      <div className="p-8 rounded-xl bg-gray-100 dark:bg-gray-800">
        <h2 className="text-2xl font-bold mb-4">
          Démarrons votre projet
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Contactez-moi pour discuter de vos besoins en gestion
          documentaire.
        </p>
        
        {isLoggedIn && editingStates.contactEmail ? (
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={texts.contactEmail}
              onChange={(e) => {
                const newValue = e.target.value;
                setTexts(prev => ({ ...prev, contactEmail: newValue }));
                if (newValue.length > MAX_LENGTHS.contactEmail) {
                  setTitleError(
                    `L'email ne doit pas dépasser ${MAX_LENGTHS.contactEmail} caractères`
                  );
                } else {
                  setTitleError("");
                }
              }}
              className={`px-4 py-2 rounded-lg border 
                ${titleError ? "border-red-500" : "border-gray-300"} 
                dark:border-gray-600 dark:bg-gray-700 dark:text-white 
                focus:ring-2 focus:ring-blue-500`}
              placeholder="Adresse email"
            />
            <button
              onClick={() => {
                handleTextUpdate("contactEmail", texts.contactEmail);
                toggleEditing("contactEmail", false);
              }}
              className={`p-2 ${
                titleError
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-green-600 hover:text-green-700"
              } dark:text-green-500 dark:hover:text-green-400`}
              disabled={!!titleError}
              title="Sauvegarder"
            >
              <HiOutlineCheck className="w-5 h-5" />
            </button>
            <button
              onClick={() => toggleEditing("contactEmail", false)}
              className="p-2 text-red-600 hover:text-red-700 
                dark:text-red-500 dark:hover:text-red-400"
              title="Annuler"
            >
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <a
              href={`mailto:${texts.contactEmail}`}
              className="inline-flex items-center gap-2 px-6 py-3 
                bg-customblue text-white rounded-lg hover:bg-customblue 
                transition-colors"
            >
              <HiOutlineEnvelope className="text-xl" />
              Me contacter
            </a>
            {isLoggedIn && (
              <button
                onClick={() => toggleEditing("contactEmail", true)}
                className="p-2 text-gray-600 hover:text-gray-700 
                  dark:text-gray-400 dark:hover:text-gray-300"
                title="Modifier l'email"
              >
                <HiOutlinePencil className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}; 