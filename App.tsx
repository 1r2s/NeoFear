
import React, { useState, useCallback } from 'react';
import GameSetup from './components/GameSetup';
import GameScreen from './components/GameScreen';
import { GamePhase } from './types';
import type { GameState, GameOverState, TranslationSet } from './types';
import { generateInitialScene, generateNextScene, generateImage } from './services/gameAIService';
import { SUPPORTED_LANGUAGES } from './constants';
import { getTranslations } from './lib/i18n';

const App: React.FC = () => {
    const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.SETUP);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [gameOverState, setGameOverState] = useState<GameOverState | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
    const [errorKey, setErrorKey] = useState<string | null>(null);
    const [selectedTheme, setSelectedTheme] = useState<string>('');
    const [languageCode, setLanguageCode] = useState<string>(SUPPORTED_LANGUAGES[0].code);

    const t = getTranslations(languageCode);

    const handleImageGeneration = useCallback(async (prompt: string) => {
        setIsImageLoading(true);
        setImageUrl(null);
        try {
            const url = await generateImage(prompt);
            setImageUrl(url);
        } catch (err) {
            console.error(err);
            setErrorKey((err as Error).message || 'ERROR_IMAGE_GENERATION');
            setImageUrl('https://picsum.photos/1280/720?grayscale&blur=2'); // Fallback image
        } finally {
            setIsImageLoading(false);
        }
    }, []);

    const startGame = useCallback(async (theme: string) => {
        setIsLoading(true);
        setErrorKey(null);
        setGameState(null);
        setGameOverState(null);
        setImageUrl(null);
        setSelectedTheme(theme);
        setGamePhase(GamePhase.PLAYING);

        const langObj = SUPPORTED_LANGUAGES.find(l => l.code === languageCode);
        const langName = langObj ? langObj.name : 'English';

        try {
            const initialState = await generateInitialScene(theme, langName);
            setGameState(initialState);
            await handleImageGeneration(initialState.imagePrompt);
        } catch (err) {
            setErrorKey((err as Error).message);
            setGamePhase(GamePhase.SETUP);
        } finally {
            setIsLoading(false);
        }
    }, [handleImageGeneration, languageCode]);

    const handleChoice = useCallback(async (choice: string) => {
        if (!gameState) return;
        
        setIsLoading(true);
        setErrorKey(null);

        const currentStory = gameState.story;
        const currentStats = gameState.playerStats;
        const langName = SUPPORTED_LANGUAGES.find(l => l.code === languageCode)?.name || 'English';

        try {
            const nextState = await generateNextScene(selectedTheme, currentStory, choice, currentStats, langName);
            
            if (nextState.isGameOver) {
                setGameState(null);
                setGameOverState({
                    reason: nextState.reason,
                    finalImagePrompt: nextState.finalImagePrompt,
                    uiText: nextState.uiText,
                });
                 setGamePhase(GamePhase.GAME_OVER);
                await handleImageGeneration(nextState.finalImagePrompt);
            } else {
                setGameState({
                    story: nextState.story,
                    imagePrompt: nextState.imagePrompt,
                    choices: nextState.choices,
                    playerStats: nextState.playerStats,
                });
                await handleImageGeneration(nextState.imagePrompt);
            }
        } catch (err) {
            setErrorKey((err as Error).message);
            console.error(err);
        } finally {
            setIsLoading(false);
        }

    }, [gameState, selectedTheme, languageCode, handleImageGeneration]);

    const restartGame = () => {
        setGamePhase(GamePhase.SETUP);
        setGameState(null);
        setGameOverState(null);
        setImageUrl(null);
        setErrorKey(null);
        setIsLoading(false);
        setIsImageLoading(false);
    };

    const renderError = () => {
        const errorMessage = (t as any)[errorKey as string] || t.ERROR_GENERIC;
        return (
             <div className="min-h-screen bg-black text-gray-300 flex flex-col items-center justify-center p-4 text-center">
                <h2 className="text-3xl text-red-500 mb-4 font-serif">{t.errorTitle}</h2>
                <p className="text-xl text-gray-400 mb-8 max-w-lg">{errorMessage}</p>
                <button onClick={restartGame} className="px-6 py-2 bg-red-700 text-white font-bold rounded hover:bg-red-600 transition-colors">
                    {t.errorButton}
                </button>
            </div>
        );
    };

    const renderContent = () => {
        if (errorKey && gamePhase !== GamePhase.PLAYING) {
            return renderError();
        }

        switch (gamePhase) {
            case GamePhase.SETUP:
                return <GameSetup onStartGame={startGame} isLoading={isLoading} languageCode={languageCode} setLanguageCode={setLanguageCode} />;
            case GamePhase.PLAYING:
            case GamePhase.GAME_OVER:
                return (
                    <GameScreen
                        t={t}
                        gameState={gameState}
                        gameOverState={gameOverState}
                        imageUrl={imageUrl}
                        onChoiceSelect={handleChoice}
                        onRestart={restartGame}
                        isLoading={isLoading}
                        isImageLoading={isImageLoading}
                    />
                );
            default:
                return <GameSetup onStartGame={startGame} isLoading={isLoading} languageCode={languageCode} setLanguageCode={setLanguageCode} />;
        }
    };

    return <div className="bg-black min-h-screen">{renderContent()}</div>;
};

export default App;
