export interface StyleAnalysis {
  avgSentenceLength: number;
  emojiUsageRate: number;
  hashtagUsageRate: number;
  tone: 'bullish' | 'bearish' | 'neutral';
  technicalLevel: 'technical' | 'casual' | 'mixed';
  commonPhrases: string[];
  vocabularyLevel: number;
}

export interface VisualStyleAnalysis {
  dominantColors: string[];
  layoutPreference: string;
  typography: string;
  imageStyle: string;
}

export interface KolProfile {
  id: string;
  userId: string;
  twitterHandle: string;
  displayName: string | null;
  bio: string | null;
  followerCount: number | null;
  profileImageUrl: string | null;
  bannerImageUrl: string | null;
  isPublic: boolean;
  styleAnalysis: StyleAnalysis | null;
  visualStyleAnalysis: VisualStyleAnalysis | null;
  tweetCount: number;
  lastAnalyzedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateKolProfileDto {
  twitterHandle: string;
  isPublic?: boolean;
}

export interface UpdateKolProfileDto {
  displayName?: string;
  bio?: string;
  isPublic?: boolean;
}
