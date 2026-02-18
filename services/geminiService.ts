import { GoogleGenAI, Type } from "@google/genai";
import { HSKLevel, Word, GrammarTopic } from '../types';

// Initialize the Gemini AI client
// Note: process.env.API_KEY is assumed to be available in the build environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-flash-preview';

/**
 * Generates an example sentence for a specific word.
 */
export const generateExampleSentence = async (word: Word): Promise<{ sentence: string; pinyin: string; translation: string } | null> => {
  try {
    const prompt = `
      Create a simple Chinese example sentence using the word "${word.char}" (${word.pinyin}).
      The sentence should be suitable for an HSK Level ${word.level} student.
      Return the result in JSON format with "sentence" (Chinese characters), "pinyin", and "translation" (English).
      Keep the sentence relatively short and simple.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                sentence: { type: Type.STRING },
                pinyin: { type: Type.STRING },
                translation: { type: Type.STRING }
            },
            required: ["sentence", "pinyin", "translation"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);

  } catch (error) {
    console.error("Error generating example sentence:", error);
    return null;
  }
};

/**
 * Generates a grammar explanation lesson.
 */
export const generateGrammarLesson = async (topic: GrammarTopic): Promise<string | null> => {
  try {
    const prompt = `
      You are a helpful Chinese language tutor.
      Explain the Chinese grammar topic: "${topic.title}" which is suitable for HSK Level ${topic.level}.
      Description: ${topic.description}.
      
      Structure your response in clear, concise Markdown.
      Include:
      1. A simple explanation of the rule.
      2. The sentence structure/formula (e.g., Subject + Verb + ...).
      3. Three clear example sentences with Characters, Pinyin, and English translation.
      
      Make the tone encouraging and easy to understand for a beginner/intermediate learner.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text || null;
  } catch (error) {
    console.error("Error generating grammar lesson:", error);
    return null;
  }
};