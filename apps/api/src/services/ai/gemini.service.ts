import { getGeminiClient, AI_MODELS } from '../../config/ai-providers';
import { logger } from '../../utils/logger';

export interface GeminiGenerateOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export class GeminiService {
  async generateText(options: GeminiGenerateOptions): Promise<string> {
    const client = getGeminiClient();
    if (!client) {
      throw new Error('GEMINI_API_KEY is not set. Add it to apps/api/.env to use tweet generation.');
    }
    const { prompt, maxTokens = 1024, temperature = 0.7 } = options;

    try {
      const model = client.getGenerativeModel({
        model: AI_MODELS.GEMINI_FLASH,
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature,
        },
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      if (!text) {
        throw new Error('No text content in Gemini response');
      }

      return text;
    } catch (error: unknown) {
      logger.error('Gemini API error:', error);
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('429') || /rate\s*limit/i.test(msg)) {
        throw new Error('RATE_LIMIT: Gemini API rate limit exceeded. Please try again in a minute.');
      }
      throw new Error(`Failed to generate text with Gemini: ${msg}`);
    }
  }

  async generateJSON<T = any>(options: GeminiGenerateOptions): Promise<T> {
    const text = await this.generateText(options);

    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonText = jsonMatch ? jsonMatch[1] : text;

    try {
      return JSON.parse(jsonText.trim());
    } catch (error) {
      logger.error('Failed to parse Gemini JSON response:', { text, error });
      throw new Error('Failed to parse JSON from Gemini response');
    }
  }
}

export default new GeminiService();
