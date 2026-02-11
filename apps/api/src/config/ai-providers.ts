import { GoogleGenerativeAI } from '@google/generative-ai';

// Lazy-initialized Gemini client
let _geminiClient: GoogleGenerativeAI | null | undefined;

export function getGeminiClient(): GoogleGenerativeAI | null {
  if (_geminiClient === undefined) {
    const key = process.env.GEMINI_API_KEY?.trim();
    _geminiClient = key ? new GoogleGenerativeAI(key) : null;
  }
  return _geminiClient;
}

export const AI_MODELS = {
  GEMINI_FLASH: 'gemini-2.5-flash',
} as const;
