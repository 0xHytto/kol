import apiClient from '@/lib/api-client';

export interface SuggestPromptResponse {
  prompt: string;
}

export interface GenerateImageResponse {
  imageUrl: string;
  prompt: string;
}

/**
 * 트윗 내용을 기반으로 Gemini가 DALL-E 3 프롬프트를 제안합니다.
 */
export async function suggestImagePrompt(tweetContent: string): Promise<SuggestPromptResponse> {
  const res = await apiClient.post('/image-generator/suggest-prompt', { tweetContent });
  return res.data;
}

/**
 * 프롬프트를 기반으로 DALL-E 3 이미지를 생성합니다.
 * DALL-E 3는 최대 60초 이상 걸릴 수 있으므로 timeout을 120초로 설정합니다.
 */
export async function generateImage(prompt: string): Promise<GenerateImageResponse> {
  const res = await apiClient.post('/image-generator/generate', { prompt }, { timeout: 120_000 });
  return res.data;
}
