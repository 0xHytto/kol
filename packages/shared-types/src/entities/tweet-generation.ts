import { TweetType } from '../enums/tweet-type';
import { GenerationStatus } from '../enums/generation-status';

export interface TweetVariant {
  content: string;
  estimatedEngagement?: number;
}

export interface GeneratedContent {
  variants: TweetVariant[];
}

export interface TweetGeneration {
  id: string;
  userId: string;
  generationType: 'single' | 'thread';
  tweetType: TweetType;
  kolProfileIds: string[];
  inputText: string | null;
  koreanInput: string | null;
  isTranslated: boolean;
  generatedContent: GeneratedContent;
  selectedVariantIndex: number | null;
  threadLength: number | null;
  status: GenerationStatus;
  aiProvider: 'claude' | 'gpt4';
  generationParams: Record<string, any> | null;
  creditsUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GenerateTweetDto {
  tweetType: TweetType;
  kolProfileIds: string[];
  inputText?: string;
  koreanInput?: string;
  generationType?: 'single' | 'thread';
  threadLength?: number;
  includeEmojis?: boolean;
  includeHashtags?: boolean;
  aiProvider?: 'claude' | 'gpt4';
  language?: 'en' | 'kr';
}
