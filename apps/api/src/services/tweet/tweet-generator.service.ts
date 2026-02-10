import { TweetType } from '@kol/shared-types';
import claudeService from '../ai/claude.service';
import { KolProfile } from '../../models/kol-profile.model';
import { TweetGeneration } from '../../models/tweet-generation.model';
import { logger } from '../../utils/logger';

export interface GenerateTweetRequest {
  userId: string;
  kolId?: string;
  tone: 'professional' | 'casual' | 'hype' | 'technical' | 'meme';
  topic: string;
  options?: {
    includeEmojis?: boolean;
    includeHashtags?: boolean;
    count?: number;
  };
}

export interface TweetVariant {
  content: string;
  length: number;
}

export interface GenerateTweetResponse {
  variants: TweetVariant[];
  kolName?: string;
  tone: string;
}

const TONE_INSTRUCTIONS = {
  professional: {
    description: 'Professional, authoritative, and trustworthy',
    examples: 'Use formal language, industry terminology, maintain credibility',
    style: 'Analysis-driven, data-focused, measured tone',
  },
  casual: {
    description: 'Friendly, conversational, and approachable',
    examples: 'Use common slang like "gm", "ser", "lol", be relatable',
    style: 'Short sentences, informal language, personal touches',
  },
  hype: {
    description: 'Exciting, energetic, and optimistic',
    examples: 'Use emojis like 🚀💰📈, capital letters for emphasis, exclamation marks',
    style: 'Bold predictions, enthusiasm, FOMO-inducing',
  },
  technical: {
    description: 'Detailed, analytical, and data-driven',
    examples: 'Include metrics, charts references, technical analysis',
    style: 'Structured, educational, comprehensive',
  },
  meme: {
    description: 'Humorous, playful, and meme-inspired',
    examples: 'Use popular meme formats, jokes, self-deprecating humor',
    style: 'Lighthearted, relatable, funny',
  },
};

export class TweetGeneratorService {
  async generateTweets(request: GenerateTweetRequest): Promise<GenerateTweetResponse> {
    const { userId, kolId, tone, topic, options = {} } = request;
    const { includeEmojis = true, includeHashtags = true, count = 3 } = options;

    // Get KOL style if specified
    let kolStyle = null;
    let kolName = 'Custom';

    if (kolId) {
      kolStyle = await KolProfile.findById(kolId);
      kolName = kolStyle?.displayName || kolStyle?.twitterHandle || 'Unknown KOL';
    }

    // Build prompt
    const prompt = this.buildPrompt({
      kolStyle,
      tone,
      topic,
      includeEmojis,
      includeHashtags,
      count,
    });

    logger.info('Generating tweets', { userId, kolId, tone, topic });

    // Call Claude API
    const response = await claudeService.generateJSON<{ tweets: string[] }>({
      prompt,
      maxTokens: 2048,
      temperature: 0.8,
    });

    // Parse and validate tweets
    const variants: TweetVariant[] = response.tweets.map((content: string) => ({
      content: content.trim(),
      length: content.trim().length,
    }));

    // Save generation to database
    await this.saveGeneration({
      userId,
      kolId,
      tone,
      topic,
      variants,
    });

    return {
      variants,
      kolName,
      tone,
    };
  }

  private buildPrompt({
    kolStyle,
    tone,
    topic,
    includeEmojis,
    includeHashtags,
    count,
  }: {
    kolStyle: any;
    tone: string;
    topic: string;
    includeEmojis: boolean;
    includeHashtags: boolean;
    count: number;
  }): string {
    const toneInstructions = TONE_INSTRUCTIONS[tone as keyof typeof TONE_INSTRUCTIONS];

    let prompt = `You are an expert at writing engaging tweets for Web3/crypto topics.

TASK: Generate ${count} different tweet versions about: "${topic}"

TONE: ${toneInstructions.description}
- ${toneInstructions.examples}
- ${toneInstructions.style}
`;

    // Add KOL style if available
    if (kolStyle?.styleAnalysis) {
      const style = kolStyle.styleAnalysis;
      prompt += `
WRITING STYLE (based on ${kolStyle.displayName || kolStyle.twitterHandle}):
- Sentence length: ${style.avg_sentence_length || 'medium'} words
- Emoji usage: ${style.emoji_usage || 'moderate'}
- Common phrases: ${style.common_phrases?.join(', ') || 'none'}
- Technical level: ${style.technical_level || 'mixed'}
`;
    }

    prompt += `
REQUIREMENTS:
- Maximum 280 characters per tweet
- ${includeEmojis ? 'Include relevant emojis' : 'No emojis'}
- ${includeHashtags ? 'Include 1-2 relevant hashtags' : 'No hashtags'}
- Each version should have a different angle or approach
- Make them authentic and engaging
- Ensure they sound natural, not AI-generated

OUTPUT FORMAT:
Return ONLY a JSON object with this exact structure:
{
  "tweets": [
    "First tweet version here...",
    "Second tweet version here...",
    "Third tweet version here..."
  ]
}

Do not include any other text, explanations, or markdown formatting. Just the raw JSON.`;

    return prompt;
  }

  private async saveGeneration({
    userId,
    kolId,
    tone,
    topic,
    variants,
  }: {
    userId: string;
    kolId?: string;
    tone: string;
    topic: string;
    variants: TweetVariant[];
  }) {
    try {
      await TweetGeneration.create({
        userId,
        generationType: 'single',
        tweetType: tone,
        kolProfileIds: kolId ? [kolId] : [],
        inputText: topic,
        generatedContent: { variants },
        status: 'completed',
        aiProvider: 'claude',
        creditsUsed: 1,
      });
    } catch (error) {
      logger.error('Error saving tweet generation:', error);
      // Don't throw - generation succeeded, saving is secondary
    }
  }
}

export default new TweetGeneratorService();
