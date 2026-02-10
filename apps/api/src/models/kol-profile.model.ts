import mongoose, { Schema, Document } from 'mongoose';

export interface IStyleAnalysis {
  avg_sentence_length?: number;
  emoji_usage?: string;
  hashtag_usage?: string;
  tone?: string;
  technical_level?: string;
  common_phrases?: string[];
  vocabulary_level?: number;
}

export interface IKolProfile extends Document {
  userId: string;
  twitterHandle: string;
  displayName: string;
  bio?: string;
  followerCount?: number;
  profileImageUrl?: string;
  bannerImageUrl?: string;
  isPublic: boolean;
  styleAnalysis?: IStyleAnalysis;
  visualStyleAnalysis?: any;
  tweetCount: number;
  lastAnalyzedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const KolProfileSchema = new Schema<IKolProfile>(
  {
    userId: { type: String, required: true },
    twitterHandle: { type: String, required: true },
    displayName: { type: String, required: true },
    bio: String,
    followerCount: Number,
    profileImageUrl: String,
    bannerImageUrl: String,
    isPublic: { type: Boolean, default: false },
    styleAnalysis: {
      type: Object,
      default: {},
    },
    visualStyleAnalysis: Object,
    tweetCount: { type: Number, default: 0 },
    lastAnalyzedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
KolProfileSchema.index({ userId: 1 });
KolProfileSchema.index({ twitterHandle: 1 });
KolProfileSchema.index({ isPublic: 1, followerCount: -1 });

export const KolProfile = mongoose.model<IKolProfile>('KolProfile', KolProfileSchema);
