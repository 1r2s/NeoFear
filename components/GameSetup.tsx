import React from 'react';
import { HORROR_THEMES, SUPPORTED_LANGUAGES, CONTRIBUTORS } from '../constants';
import { getTranslations } from '../lib/i18n';

interface GameSetupProps {
  onStartGame: (theme: string) => void;
  isLoading: boolean;
  languageCode: string;
  setLanguageCode: (code: string) => void;
}

const GameSetup: React.FC<GameSetupProps> = ({ onStartGame, isLoading, languageCode, setLanguageCode }) => {
  const t = getTranslations(languageCode);

  const handleStartGame = (themeId: string) => {
    onStartGame(themeId);
  };

  return (
    <div className="min-h-screen bg-black text-gray-300 flex flex-col items-center justify-center p-4 font-serif relative">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold text-red-700 mb-4 tracking-wider" style={{ textShadow: '2px 2px 4px #000' }}>
          NeoFear
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-8">
          {t.subtitle}
        </p>

        <a
          href="https://www.patreon.com/14678538/join"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-2 mb-8 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-500 transition-colors font-sans focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          {(t as any).supportMe || 'Support Me on Patreon'}
        </a>

        <div className="mb-8 max-w-xs mx-auto">
            <label htmlFor="language-select" className="block text-sm font-medium text-gray-400 mb-2 font-sans">{t.languageLabel}</label>
            <div className="relative">
                 <select 
                    id="language-select"
                    value={languageCode}
                    onChange={(e) => setLanguageCode(e.target.value)}
                    className="appearance-none block w-full bg-gray-900 border-2 border-gray-800 rounded-md shadow-sm py-2 pl-3 pr-10 text-white focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm font-sans"
                >
                    {SUPPORTED_LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
        </div>
        
        <h2 className="text-3xl font-semibold text-gray-200 mb-8">{t.chooseYourNightmare}</h2>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-red-600"></div>
            <p className="text-red-500 mt-4 text-lg">{t.loadingMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl w-full">
          {HORROR_THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleStartGame(theme.id)}
              className="bg-gray-900 border-2 border-gray-800 rounded-lg p-6 text-left flex flex-col h-full hover:border-red-600 hover:bg-black transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              <div className="text-5xl mb-4">{theme.emoji}</div>
              <h3 className="text-2xl font-bold text-gray-100 mb-2">{(t as any)[theme.titleKey]}</h3>
              <p className="text-gray-400 flex-grow">{(t as any)[theme.descriptionKey]}</p>
            </button>
          ))}
        </div>
      )}

      <footer className="absolute bottom-4 text-center text-gray-500 text-sm w-full font-sans">
        {CONTRIBUTORS.length > 0 && (
          <div className="mb-2">
            <h3 className="font-semibold text-gray-400 mb-1">{(t as any).creditsTitle || 'Credits'}</h3>
            <p>{CONTRIBUTORS.join(', ')}</p>
          </div>
        )}
        <p className="mb-1">Discord: z3t2</p>
        <p>{(t as any).copyrightNotice || '© 2025 NEOTICA. All rights reserved.'}</p>
      </footer>
    </div>
  );
};

export default GameSetup;