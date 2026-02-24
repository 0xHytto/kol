import apiClient from './api-client';

export interface TweetVariant {
  content: string;
  length: number;
}

export interface TweetGenerationItem {
  id: string;
  topic: string;
  tone: string;
  language: string;
  lengthRange: string;
  kolName: string | null;
  variants: TweetVariant[];
  createdAt: string;
}

export interface TweetGenerationsResponse {
  items: TweetGenerationItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface ImageGenerationItem {
  id: string;
  prompt: string;
  imageUrl: string;
  filename: string;
  tweetContent: string | null;
  createdAt: string;
}

export interface ImageGenerationsResponse {
  items: ImageGenerationItem[];
  total: number;
  limit: number;
  offset: number;
}

export async function getTweetGenerations(
  limit = 20,
  offset = 0
): Promise<TweetGenerationsResponse> {
  const res = (await apiClient.get('/tweet-generator/generations', {
    params: { limit, offset },
  })) as any;
  return res.data;
}

export async function getImageGenerations(
  limit = 20,
  offset = 0
): Promise<ImageGenerationsResponse> {
  const res = (await apiClient.get('/image-generator/generations', {
    params: { limit, offset },
  })) as any;
  return res.data;
}
