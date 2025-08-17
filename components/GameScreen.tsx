
import React, { useState, useEffect } from 'react';
import type { GameState, GameOverState, PlayerStats, TranslationSet } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { BrainIcon, BackpackIcon } from './IconComponents';

const useTypewriter = (text: string, speed = 25) => {
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        setDisplayText('');
        if (text) {
            let i = 0;
            const typingInterval = setInterval(() => {
                if (i < text.length) {
                    setDisplayText(prevText => prevText + text.charAt(i));
                    i++;
                } else {
                    clearInterval(typingInterval);
                }
            }, speed);

            return () => {
                clearInterval(typingInterval);
            };
        }
    }, [text, speed]);

    return displayText;
};

const PlayerStatsDisplay: React.FC<{ stats: PlayerStats, t: TranslationSet }> = ({ stats, t }) => {
    const sanityColor = stats.sanity > 60 ? 'text-green-400' : stats.sanity > 30 ? 'text-yellow-400' : 'text-red-600';
    const sanityBgColor = stats.sanity > 60 ? 'bg-green-500' : stats.sanity > 30 ? 'bg-yellow-500' : 'bg-red-600';

    return (
        <div className="bg-black bg-opacity-70 backdrop-blur-sm p-4 rounded-lg border border-gray-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-8">
            <div className="flex items-center space-x-3 w-full md:w-auto">
                <BrainIcon className={`w-8 h-8 flex-shrink-0 ${sanityColor}`} />
                <div className="flex-grow">
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="text-sm text-gray-400 font-sans">{t.sanity}</span>
                        <span className={`text-lg font-bold font-sans ${sanityColor}`}>{stats.sanity}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full ${sanityBgColor} transition-all duration-500`} style={{ width: `${stats.sanity}%` }}></div>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-3 w-full md:w-auto">
                <BackpackIcon className="w-8 h-8 text-yellow-300 flex-shrink-0" />
                <div className="flex-grow">
                    <span className="text-sm text-gray-400 font-sans">{t.inventory}</span>
                    <p className="text-lg font-semibold text-gray-200 capitalize truncate">
                        {stats.inventory.length > 0 ? stats.inventory.join(', ') : t.inventoryEmpty}
                    </p>
                </div>
            </div>
        </div>
    );
};

interface GameScreenProps {
  t: TranslationSet;
  gameState: GameState | null;
  gameOverState: GameOverState | null;
  imageUrl: string | null;
  onChoiceSelect: (choice: string) => void;
  onRestart: () => void;
  isLoading: boolean;
  isImageLoading: boolean;
}

const GameScreen: React.FC<GameScreenProps> = ({
  t, gameState, gameOverState, imageUrl, onChoiceSelect, onRestart, isLoading, isImageLoading,
}) => {
    const storyText = useTypewriter(gameOverState ? gameOverState.reason : gameState?.story || '');
    
    const currentStats = gameState?.playerStats;

    return (
        <div className="min-h-screen bg-black text-gray-300 font-serif flex flex-col p-4 gap-4">
            {currentStats && <PlayerStatsDisplay stats={currentStats} t={t} />}

            <div className="flex-grow flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-3/5 flex-shrink-0">
                    <div className="aspect-video bg-gray-900 rounded-lg border-2 border-gray-800 flex items-center justify-center overflow-hidden relative shadow-lg shadow-red-900/20">
                        {isImageLoading || !imageUrl ? (
                             <div className="flex flex-col items-center text-gray-500">
                                <LoadingSpinner className="w-12 h-12"/>
                                <p className="mt-4 font-sans">{t.imageLoadingMessage}</p>
                            </div>
                        ) : (
                            <img src={imageUrl} alt="Horror scene" className="w-full h-full object-cover animate-[fadeIn_1s_ease-in-out]" />
                        )}
                         <div className="absolute inset-0 bg-black opacity-10 pointer-events-none"></div>
                         <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-lg"></div>
                    </div>
                </div>
                
                <div className="w-full md:w-2/5 bg-gray-900 bg-opacity-50 border border-gray-800 rounded-lg p-6 flex flex-col">
                    <div className="flex-grow overflow-y-auto pr-2" style={{maxHeight: '60vh'}}>
                        <p className="text-lg md:text-xl leading-relaxed text-gray-200 whitespace-pre-wrap">
                            {storyText}
                        </p>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-700">
                        {isLoading && !gameOverState && (
                            <div className="flex items-center justify-center text-red-400 font-sans">
                                <LoadingSpinner className="w-6 h-6 mr-3" />
                                <span>{t.aiThinkingMessage}</span>
                            </div>
                        )}

                        {!isLoading && gameState && (
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                                {gameState.choices.map((choice, index) => (
                                    <button
                                        key={index}
                                        onClick={() => onChoiceSelect(choice)}
                                        disabled={isLoading}
                                        className="w-full text-left p-4 bg-gray-800 border border-gray-700 rounded-md hover:bg-red-900 hover:border-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {choice}
                                    </button>
                                ))}
                            </div>
                        )}

                        {gameOverState && !isLoading && (
                            <div className="text-center animate-[fadeIn_1s_ease-in-out]">
                                <h2 className="text-4xl font-bold text-red-700 mb-4">{gameOverState.uiText?.gameOverMessage || t.gameOverDefault}</h2>
                                <button
                                    onClick={onRestart}
                                    className="px-8 py-3 bg-red-700 text-white font-bold rounded-lg hover:bg-red-600 transition-colors font-sans"
                                >
                                    {gameOverState.uiText?.restartButton || t.restartDefault}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameScreen;
