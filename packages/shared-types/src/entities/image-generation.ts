import { ImageFormat } from '../enums/image-format';
import { GenerationStatus } from '../enums/generation-status';

export interface StylePreferences {
  stylePreset: 'clean' | 'minimalist' | 'meme-style' | 'professional' | 'retro';
  colorPalette?: string[];
  includeBranding?: boolean;
}

export interface ImageGeneration {
  id: string;
  userId: string;
  kolProfileId: string | null;
  imageFormat: ImageFormat;
  projectName: string | null;
  projectDescription: string | null;
  uploadedImageUrls: string[];
  templateId: string | null;
  stylePreferences: StylePreferences | null;
  generatedImageUrls: string[];
  selectedImageUrl: string | null;
  isBatch: boolean;
  batchCount: number;
  isAnimated: boolean;
  animationUrl: string | null;
  status: GenerationStatus;
  aiProvider: string;
  generationParams: Record<string, any> | null;
  creditsUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GenerateImageDto {
  imageFormat: ImageFormat;
  kolProfileId?: string;
  projectName?: string;
  projectDescription?: string;
  uploadedImageUrls?: string[];
  templateId?: string;
  stylePreferences?: StylePreferences;
  isBatch?: boolean;
  batchCount?: number;
  isAnimated?: boolean;
}
