import { HiOutlineAcademicCap } from "react-icons/hi";

interface Texts {
  mainTitle: string;
  subtitle: string;
  documentumText: string;
  [key: string]: string;
}

interface HeroSectionProps {
  texts: Texts;
  isLoggedIn: boolean;
  editingStates: {
    mainTitle: boolean;
    subtitle: boolean;
    documentumText: boolean;
    [key: string]: boolean;
  };
  titleError: string;
  MAX_LENGTHS: {
    mainTitle: number;
    subtitle: number;
    documentumText: number;
    [key: string]: number;
  };
  toggleEditing: (field: string, value: boolean) => void;
  handleTextUpdate: (key: string, value: string) => void;
  setTexts: (texts: Texts | ((prev: Texts) => Texts)) => void;
  setTitleError: (error: string) => void;
}

export function HeroSection({
  texts,
  isLoggedIn,
  editingStates,
  titleError,
  MAX_LENGTHS,
  toggleEditing,
  handleTextUpdate,
  setTexts,
  setTitleError,
}: HeroSectionProps) {
  return (
    <section className="mb-20">
      {isLoggedIn && !editingStates.mainTitle ? (
        <div className="group relative">
          <h2 className="text-4xl font-bold mb-6">{texts.mainTitle}</h2>
          <button
            onClick={() => toggleEditing("mainTitle", true)}
            className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ✏️
          </button>
        </div>
      ) : isLoggedIn && editingStates.mainTitle ? (
        <div className="space-y-2">
          <div className="flex gap-2 items-start">
            <input
              type="text"
              value={texts.mainTitle}
              onChange={(e) => {
                const newTitle = e.target.value;
                setTexts((prev) => ({ ...prev, mainTitle: newTitle }));
                if (newTitle.length > MAX_LENGTHS.mainTitle) {
                  setTitleError(
                    `Le titre ne doit pas dépasser ${MAX_LENGTHS.mainTitle} caractères`
                  );
                } else {
                  setTitleError("");
                }
              }}
              className={`text-4xl font-bold bg-transparent border-b-2 
              ${titleError ? "border-red-500" : "border-blue-500"} 
              focus:outline-none focus:border-blue-700 w-full`}
              autoFocus
            />
            <button
              onClick={() => {
                handleTextUpdate("mainTitle", texts.mainTitle);
                toggleEditing("mainTitle", false);
              }}
              className={`px-4 py-2 ${
                titleError
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white rounded-lg transition-colors`}
              disabled={!!titleError}
            >
              Save
            </button>
            <button
              onClick={() => toggleEditing("mainTitle", false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>

          {titleError && (
            <div className="text-red-500 text-sm">{titleError}</div>
          )}

          <div
            className={`text-sm ${
              texts.mainTitle.length > MAX_LENGTHS.mainTitle
                ? "text-red-500"
                : "text-gray-500"
            }`}
          >
            {texts.mainTitle.length}/{MAX_LENGTHS.mainTitle} caractères
          </div>
        </div>
      ) : (
        <h2 className="text-4xl font-bold mb-6">{texts.mainTitle}</h2>
      )}

      {isLoggedIn && !editingStates.subtitle ? (
        <div className="group relative">
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mb-4">
            {texts.subtitle}
          </p>
          <button
            onClick={() => toggleEditing("subtitle", true)}
            className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ✏️
          </button>
        </div>
      ) : isLoggedIn && editingStates.subtitle ? (
        <div className="space-y-2">
          <div className="flex gap-2 items-start">
            <input
              type="text"
              value={texts.subtitle}
              onChange={(e) => {
                const newValue = e.target.value;
                setTexts((prev) => ({ ...prev, subtitle: newValue }));
                if (newValue.length > MAX_LENGTHS.subtitle) {
                  setTitleError(
                    `Le texte ne doit pas dépasser ${MAX_LENGTHS.subtitle} caractères`
                  );
                } else {
                  setTitleError("");
                }
              }}
              className={`text-xl text-gray-600 dark:text-gray-400 bg-transparent border-b-2 
              ${titleError ? "border-red-500" : "border-blue-500"} 
              focus:outline-none focus:border-blue-700 w-full`}
              autoFocus
            />
            <button
              onClick={() => {
                handleTextUpdate("subtitle", texts.subtitle);
                toggleEditing("subtitle", false);
              }}
              className={`px-4 py-2 ${
                titleError
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white rounded-lg transition-colors`}
              disabled={!!titleError}
            >
              Save
            </button>
            <button
              onClick={() => toggleEditing("subtitle", false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>

          {titleError && (
            <div className="text-red-500 text-sm">{titleError}</div>
          )}

          <div
            className={`text-sm ${
              texts.subtitle.length > MAX_LENGTHS.subtitle
                ? "text-red-500"
                : "text-gray-500"
            }`}
          >
            {texts.subtitle.length}/{MAX_LENGTHS.subtitle} caractères
          </div>
        </div>
      ) : (
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mb-4">
          {texts.subtitle}
        </p>
      )}

      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
        <HiOutlineAcademicCap className="text-xl" />
        {isLoggedIn && !editingStates.documentumText ? (
          <div className="group relative">
            <p className="text-lg">{texts.documentumText}</p>
            <button
              onClick={() => toggleEditing("documentumText", true)}
              className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ✏️
            </button>
          </div>
        ) : isLoggedIn && editingStates.documentumText ? (
          <div className="space-y-2">
            <div className="flex gap-2 items-start">
              <input
                type="text"
                value={texts.documentumText}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setTexts((prev) => ({
                    ...prev,
                    documentumText: newValue,
                  }));
                  if (newValue.length > MAX_LENGTHS.documentumText) {
                    setTitleError(
                      `Le texte ne doit pas dépasser ${MAX_LENGTHS.documentumText} caractères`
                    );
                  } else {
                    setTitleError("");
                  }
                }}
                className={`text-lg bg-transparent border-b-2 
                ${titleError ? "border-red-500" : "border-blue-500"} 
                focus:outline-none focus:border-blue-700 w-full`}
                autoFocus
              />
              <button
                onClick={() => {
                  handleTextUpdate("documentumText", texts.documentumText);
                  toggleEditing("documentumText", false);
                }}
                className={`px-4 py-2 ${
                  titleError
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white rounded-lg transition-colors`}
                disabled={!!titleError}
              >
                Save
              </button>
              <button
                onClick={() => toggleEditing("documentumText", false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>

            {titleError && (
              <div className="text-red-500 text-sm">{titleError}</div>
            )}

            <div
              className={`text-sm ${
                texts.documentumText.length > MAX_LENGTHS.documentumText
                  ? "text-red-500"
                  : "text-gray-500"
              }`}
            >
              {texts.documentumText.length}/{MAX_LENGTHS.documentumText}{" "}
              caractères
            </div>
          </div>
        ) : (
          <p className="text-lg">{texts.documentumText}</p>
        )}
      </div>
    </section>
  );
}
