import path from 'path';
import fs from 'fs/promises';
import { InferenceClient } from '@huggingface/inference';
import { v4 as uuidv4 } from 'uuid';
import { getGeminiClient, getHFToken, AI_MODELS, HF_MODELS } from '../../config/ai-providers';
import { ImageGeneration } from '../../models/image-generation.model';
import { logger } from '../../utils/logger';

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images');
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

async function ensureImagesDir(): Promise<void> {
  await fs.mkdir(IMAGES_DIR, { recursive: true });
}

export class ImageGeneratorService {
  /**
   * Gemini를 사용해 트윗 내용에 맞는 이미지 프롬프트를 생성합니다.
   */
  async suggestPrompt(tweetContent: string): Promise<{ prompt: string }> {
    const gemini = getGeminiClient();
    if (!gemini) {
      throw new Error('GEMINI_API_KEY is not set. Add it to apps/api/.env to use prompt suggestion.');
    }

    const model = gemini.getGenerativeModel({
      model: AI_MODELS.GEMINI_FLASH,
      generationConfig: { maxOutputTokens: 400, temperature: 0.7 },
    });

    const systemPrompt = `You are an image prompt engineer specializing in Web3 and crypto visual content.

Given this tweet content:
"""
${tweetContent}
"""

Write ONE single image generation prompt (under 400 characters) for a visually striking Web3/crypto Twitter post image.

Requirements:
- Specific visual descriptions: colors, composition, lighting, style, mood
- Web3/crypto aesthetics: blockchain nodes, digital gold, neon circuits, abstract finance, etc.
- Professional and eye-catching for social media
- Output ONLY the prompt text itself — no explanations, no labels, no quotes, no JSON`;

    try {
      const result = await model.generateContent(systemPrompt);
      const raw = result.response.text().trim();

      if (!raw) throw new Error('Empty response from Gemini');

      const prompt = raw
        .replace(/^```[\w]*\s*/i, '')
        .replace(/\s*```\s*$/, '')
        .replace(/^["']|["']$/g, '')
        .replace(/^(?:prompt|image prompt)[:\s]+/i, '')
        .trim();

      return { prompt: prompt.slice(0, 400) };
    } catch (error) {
      logger.error('Gemini prompt suggestion error:', error);
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to suggest prompt: ${msg}`);
    }
  }

  /**
   * Hugging Face FLUX.1-schnell로 이미지를 생성하고 로컬에 저장합니다.
   *
   * 사전 준비:
   *   1. https://huggingface.co 무료 계정 생성
   *   2. https://huggingface.co/settings/tokens 에서 Read 토큰 발급 (무료)
   *   3. apps/api/.env 에 HF_API_TOKEN=hf_xxxx 추가
   */
  async generateImage(prompt: string, tweetContent?: string): Promise<{ imageUrl: string; prompt: string }> {
    const hfToken = getHFToken();
    if (!hfToken) {
      throw new Error(
        'HF_NOT_CONFIGURED: HF_API_TOKEN이 설정되지 않았습니다.\n' +
        '1. https://huggingface.co 에서 무료 계정을 만드세요\n' +
        '2. https://huggingface.co/settings/tokens 에서 Read 토큰을 발급받으세요\n' +
        '3. apps/api/.env 에 HF_API_TOKEN=hf_xxxx 를 추가하세요'
      );
    }

    await ensureImagesDir();

    try {
      logger.info(`Generating image with HF model: ${HF_MODELS.IMAGE_GENERATION}`);

      const client = new InferenceClient(hfToken);

      // FLUX.1-schnell: 4 steps, CFG-free (guidance_scale=0)
      const imageBlob = await client.textToImage({
        model: HF_MODELS.IMAGE_GENERATION,
        inputs: prompt,
        parameters: {
          num_inference_steps: 4,
          guidance_scale: 0.0,
          width: 1024,
          height: 1024,
        },
      });

      const arrayBuffer = await imageBlob.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);

      // Content-Type으로 확장자 결정 (기본 jpeg)
      const mimeType = imageBlob.type || 'image/jpeg';
      const ext = mimeType.includes('png') ? 'png' : 'jpeg';
      const filename = `img_${Date.now()}_${uuidv4().slice(0, 8)}.${ext}`;
      const filePath = path.join(IMAGES_DIR, filename);

      await fs.writeFile(filePath, imageBuffer);
      logger.info(`Image saved: ${filename} (${imageBuffer.length} bytes)`);

      const imageUrl = `${API_BASE_URL}/images/${filename}`;

      // DB 저장 (non-fatal)
      try {
        await ImageGeneration.create({ prompt, imageUrl, filename, tweetContent: tweetContent || undefined });
      } catch (dbError) {
        logger.error('Error saving image generation to DB:', dbError);
      }

      return { imageUrl, prompt };
    } catch (error: any) {
      logger.error('HF image generation error:', error);
      const msg: string = error?.message || String(error);

      if (msg.startsWith('HF_NOT_CONFIGURED:')) throw error;

      if (msg.includes('429') || /rate.?limit/i.test(msg)) {
        throw new Error('RATE_LIMIT: Hugging Face API rate limit. Please try again in a minute.');
      }
      if (msg.includes('loading') || msg.includes('503')) {
        throw new Error('MODEL_LOADING: 모델 로딩 중입니다. 잠시 후 다시 시도해주세요.');
      }
      if (msg.includes('401') || msg.includes('unauthorized') || /invalid.?token/i.test(msg)) {
        throw new Error('HF_AUTH_ERROR: HF_API_TOKEN이 유효하지 않습니다. https://huggingface.co/settings/tokens 에서 토큰을 재발급하세요.');
      }

      throw new Error(`Failed to generate image: ${msg}`);
    }
  }
}

export default new ImageGeneratorService();
