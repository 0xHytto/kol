import { claudeClient, AI_MODELS } from '../../config/ai-providers';
import { logger } from '../../utils/logger';

export interface ClaudeGenerateOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export class ClaudeService {
  async generateText(options: ClaudeGenerateOptions): Promise<string> {
    const { prompt, maxTokens = 1024, temperature = 0.7 } = options;

    try {
      const response = await claudeClient.messages.create({
        model: AI_MODELS.CLAUDE_SONNET,
        max_tokens: maxTokens,
        temperature,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const textContent = response.content.find((block) => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in Claude response');
      }

      return textContent.text;
    } catch (error) {
      logger.error('Claude API error:', error);
      throw new Error('Failed to generate text with Claude');
    }
  }

  async generateJSON<T = any>(options: ClaudeGenerateOptions): Promise<T> {
    const text = await this.generateText(options);

    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonText = jsonMatch ? jsonMatch[1] : text;

    try {
      return JSON.parse(jsonText.trim());
    } catch (error) {
      logger.error('Failed to parse Claude JSON response:', { text, error });
      throw new Error('Failed to parse JSON from Claude response');
    }
  }
}

export default new ClaudeService();
