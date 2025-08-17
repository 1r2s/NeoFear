
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { GameState, PlayerStats, GameOverState } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set. Please set it to run the application.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        story: {
            type: Type.STRING,
            description: "The next part of the horror story narrative. It should be deeply atmospheric, descriptive, and terrifying. Build suspense and fear.",
        },
        imagePrompt: {
            type: Type.STRING,
            description: "A highly detailed, dark, and atmospheric prompt for an image generator. Focus on a first-person perspective, horror aesthetic, photorealism, unsettling details, and cinematic lighting. For example: 'A grainy, found-footage style photo of a long, dark, decaying hospital corridor from a low angle, with a single flickering light at the far end casting long, distorted shadows. The walls are stained and peeling. A lone, rusted wheelchair sits in the middle of the hallway. Eerie, unsettling atmosphere, photorealistic.'",
        },
        choices: {
            type: Type.ARRAY,
            description: "An array of 3-4 short, concise actions the player can take next. These should be distinct and have meaningful consequences.",
            items: { type: Type.STRING }
        },
        sanity: {
            type: Type.INTEGER,
            description: "The player's new sanity level (0-100), adjusted based on the events of the story. Frightening events should decrease it."
        },
        inventory: {
            type: Type.ARRAY,
            description: "The player's updated inventory. Add items they find, and remove items they use.",
            items: { type: Type.STRING }
        },
        isGameOver: {
            type: Type.BOOLEAN,
            description: "Set to true if the player has died, gone completely insane, or the story has reached a definitive, tragic end. Otherwise, false."
        },
        gameOverReason: {
            type: Type.STRING,
            description: "If isGameOver is true, provide a grim, descriptive reason for the player's demise. For example: 'The creature's shadow engulfed you, and your last sensation was a cold, sharp pain as the world faded to black.' Otherwise, this can be an empty string."
        },
        uiText: {
            type: Type.OBJECT,
            description: "If isGameOver is true, provide translations for UI elements in the requested language (e.g., for a 'Game Over' screen). Otherwise, this can be an empty object or have empty string values.",
            properties: {
                gameOverMessage: { type: Type.STRING, description: "The 'Game Over' or 'You Died' message." },
                restartButton: { type: Type.STRING, description: "Text for the 'Restart' or 'Play Again' button." }
            }
        }
    },
    propertyOrdering: ["story", "imagePrompt", "choices", "sanity", "inventory", "isGameOver", "gameOverReason", "uiText"],
    required: ["story", "imagePrompt", "choices", "sanity", "inventory", "isGameOver", "gameOverReason"]
};


export async function generateInitialScene(theme: string, language: string): Promise<GameState> {
    const systemInstruction = `You are a world-class, multilingual horror story writer. You are to act as the game master for an interactive text-based adventure. Your entire response, including all text in the JSON object, MUST be in the following language: ${language}. Do not deviate from this language under any circumstances.`;
    const prompt = `Create the opening scene for a text-based horror adventure game with the theme: "${theme}". The player has just found themselves in this situation. Set a terrifying and immersive tone. The player starts with an empty inventory and 100 sanity. The story must not be a game over on the first turn.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { 
                systemInstruction,
                responseMimeType: "application/json", 
                responseSchema: responseSchema, 
                temperature: 1, 
                topP: 0.95 
            }
        });
        
        const data = JSON.parse(response.text);

        return {
            story: data.story,
            imagePrompt: data.imagePrompt,
            choices: data.choices,
            playerStats: { sanity: 100, inventory: [] }
        };
    } catch (error) {
        console.error("Error generating initial scene:", error);
        throw new Error("ERROR_INITIAL_SCENE");
    }
}

interface NextSceneResponse {
    isGameOver: boolean;
    reason: string;
    finalImagePrompt: string;
    story: string;
    imagePrompt: string;
    choices: string[];
    playerStats: PlayerStats;
    uiText: {
        gameOverMessage: string;
        restartButton: string;
    };
}

export async function generateNextScene(theme: string, previousStory: string, playerChoice: string, playerStats: PlayerStats, language: string): Promise<NextSceneResponse> {
    const systemInstruction = `You are a world-class, multilingual horror story writer. You are to act as the game master for an interactive text-based adventure. Your entire response, including all text in the JSON object, MUST be in the following language: ${language}. Do not deviate from this language under any circumstances.`;
    const prompt = `Continue this text-based horror adventure game with the theme: "${theme}".
        The story so far: "${previousStory}"
        The player's current status is: Sanity: ${playerStats.sanity}, Inventory: [${playerStats.inventory.join(', ')}].
        The player's choice: "${playerChoice}".
        
        Generate the next part of the story.
        - React to the player's choice and intensify the horror.
        - If sanity is low, the narrative should reflect their unstable mental state (hallucinations, paranoia).
        - If a choice leads to death or insanity, set isGameOver to true, provide a grim gameOverReason, and provide translated text for the uiText object (e.g., gameOverMessage: "YOU DIED", restartButton: "Try Again?").
        - Update sanity and inventory based on events.`;

     try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { 
                systemInstruction,
                responseMimeType: "application/json", 
                responseSchema: responseSchema, 
                temperature: 1, 
                topP: 0.95 
            }
        });

        const data = JSON.parse(response.text);

        return {
            isGameOver: data.isGameOver,
            reason: data.gameOverReason,
            finalImagePrompt: data.imagePrompt,
            story: data.story,
            imagePrompt: data.imagePrompt,
            choices: data.choices,
            playerStats: {
                sanity: Math.max(0, data.sanity), // Ensure sanity doesn't go below 0
                inventory: data.inventory || []
            },
            uiText: data.uiText || { gameOverMessage: 'GAME OVER', restartButton: 'Restart' }
        };
    } catch (error) {
        console.error("Error generating next scene:", error);
        throw new Error("ERROR_NEXT_SCENE");
    }
}

export async function generateImage(prompt: string): Promise<string> {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: `dark, gritty, atmospheric horror aesthetic, cinematic lighting, photorealistic, unsettling, high-detail. ${prompt}`,
            config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '16:9' }
        });

        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("ERROR_IMAGE_GENERATION");
    }
}
