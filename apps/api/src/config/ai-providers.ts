import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// Claude (Anthropic) client
export const claudeClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// OpenAI client (optional, for future use)
export const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

export const AI_MODELS = {
  CLAUDE_SONNET: 'claude-3-5-sonnet-20241022',
  CLAUDE_HAIKU: 'claude-3-5-haiku-20241022',
  GPT4: 'gpt-4-turbo-preview',
} as const;
