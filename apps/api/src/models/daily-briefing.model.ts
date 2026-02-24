import mongoose, { Schema, Document } from 'mongoose';

export interface ITweetVariant {
  content: string;
  length: number;
}

export interface IBriefingItem {
  issue: {
    title: string;
    summary: string;
    whyItMatters: string;
    tags: string[];
  };
  tweets: ITweetVariant[];
  imageUrl?: string;
  imagePrompt?: string;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}

export type BriefingStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface IDailyBriefing extends Document {
  date: string;          // 'YYYY-MM-DD'
  researchId: mongoose.Types.ObjectId;
  items: IBriefingItem[];
  status: BriefingStatus;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TweetVariantSchema = new Schema<ITweetVariant>(
  { content: String, length: Number },
  { _id: false }
);

const BriefingItemSchema = new Schema<IBriefingItem>(
  {
    issue: {
      title: { type: String, required: true },
      summary: String,
      whyItMatters: String,
      tags: [String],
    },
    tweets: [TweetVariantSchema],
    imageUrl: String,
    imagePrompt: String,
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    error: String,
  },
  { _id: false }
);

const DailyBriefingSchema = new Schema<IDailyBriefing>(
  {
    date: { type: String, required: true },
    researchId: { type: Schema.Types.ObjectId, ref: 'DailyResearch', required: true },
    items: [BriefingItemSchema],
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'failed'],
      default: 'pending',
    },
    error: String,
  },
  { timestamps: true }
);

DailyBriefingSchema.index({ date: -1 });
DailyBriefingSchema.index({ status: 1 });

export const DailyBriefing = mongoose.model<IDailyBriefing>('DailyBriefing', DailyBriefingSchema);
