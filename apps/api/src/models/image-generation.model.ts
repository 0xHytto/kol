import mongoose, { Schema, Document } from 'mongoose';

export interface IImageGeneration extends Document {
  prompt: string;
  imageUrl: string;
  filename: string;
  tweetContent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ImageGenerationSchema = new Schema<IImageGeneration>(
  {
    prompt: { type: String, required: true },
    imageUrl: { type: String, required: true },
    filename: { type: String, required: true },
    tweetContent: { type: String },
  },
  {
    timestamps: true,
  }
);

// Index for retrieving latest first
ImageGenerationSchema.index({ createdAt: -1 });

export const ImageGeneration = mongoose.model<IImageGeneration>(
  'ImageGeneration',
  ImageGenerationSchema
);
