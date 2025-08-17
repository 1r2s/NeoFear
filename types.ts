
export enum GamePhase {
  SETUP = 'SETUP',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
}

export interface PlayerStats {
  sanity: number;
  inventory: string[];
}

export interface Scene {
  story: string;
  imagePrompt: string;
  choices: string[];
}

export interface GameState extends Scene {
  playerStats: PlayerStats;
}

export interface GameOverState {
    reason: string;
    finalImagePrompt: string;
    uiText: {
        gameOverMessage: string;
        restartButton: string;
    };
}

export type TranslationSet = { [key: string]: string };
