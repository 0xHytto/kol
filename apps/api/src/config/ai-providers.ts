import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

// Lazy-initialized Gemini client
let _geminiClient: GoogleGenerativeAI | null | undefined;

export function getGeminiClient(): GoogleGenerativeAI | null {
  if (_geminiClient === undefined) {
    const key = process.env.GEMINI_API_KEY?.trim();
    _geminiClient = key ? new GoogleGenerativeAI(key) : null;
  }
  return _geminiClient;
}

// Lazy-initialized OpenAI client
let _openaiClient: OpenAI | null | undefined;

export function getOpenAIClient(): OpenAI | null {
  if (_openaiClient === undefined) {
    const key = process.env.OPENAI_API_KEY?.trim();
    _openaiClient = key ? new OpenAI({ apiKey: key }) : null;
  }
  return _openaiClient;
}

export const AI_MODELS = {
  GEMINI_FLASH: 'gemini-2.5-flash',
  // gemini-2.0-flash: Google Search Grounding (리서치 에이전트)
  GEMINI_FLASH_SEARCH: 'gemini-2.0-flash',
} as const;

// Hugging Face
export const HF_MODELS = {
  // FLUX.1-schnell: 빠르고 고품질, 무료 티어 지원
  IMAGE_GENERATION: 'black-forest-labs/FLUX.1-schnell',
} as const;

export function getHFToken(): string | null {
  return process.env.HF_API_TOKEN?.trim() || null;
}
