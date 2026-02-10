import mongoose, { Schema, Document } from 'mongoose';

export interface ITweetGeneration extends Document {
  userId: string;
  generationType: 'single' | 'thread';
  tweetType: string;
  kolProfileIds: string[];
  inputText?: string;
  koreanInput?: string;
  isTranslated: boolean;
  generatedContent: {
    variants: Array<{
      content: string;
      length: number;
    }>;
  };
  selectedVariantIndex?: number;
  threadLength?: number;
  status: 'generating' | 'completed' | 'failed';
  aiProvider: string;
  generationParams?: any;
  creditsUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

const TweetGenerationSchema = new Schema<ITweetGeneration>(
  {
    userId: { type: String, required: true },
    generationType: { type: String, required: true },
    tweetType: { type: String, required: true },
    kolProfileIds: [String],
    inputText: String,
    koreanInput: String,
    isTranslated: { type: Boolean, default: false },
    generatedContent: {
      type: Object,
      required: true,
    },
    selectedVariantIndex: Number,
    threadLength: Number,
    status: {
      type: String,
      default: 'completed',
      enum: ['generating', 'completed', 'failed'],
    },
    aiProvider: String,
    generationParams: Object,
    creditsUsed: { type: Number, default: 1 },
  },
  {
    timestamps: true,
  }
);

// Indexes
TweetGenerationSchema.index({ userId: 1, createdAt: -1 });

export const TweetGeneration = mongoose.model<ITweetGeneration>(
  'TweetGeneration',
  TweetGenerationSchema
);
