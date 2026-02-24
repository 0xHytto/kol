import { Request, Response, NextFunction } from 'express';
import imageGeneratorService from '../services/image/image-generator.service';
import { ImageGeneration } from '../models/image-generation.model';
import { AppError } from '../middleware/error-handler.middleware';

const MAX_PROMPT_LENGTH = 4000;
const MAX_TWEET_CONTENT_LENGTH = 2000;
const MAX_GENERATIONS_LIMIT = 50;

export class ImageGeneratorController {
  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const { prompt, tweetContent } = req.body;

      if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        throw new AppError(400, 'Prompt is required', 'INVALID_INPUT');
      }
      if (prompt.length > MAX_PROMPT_LENGTH) {
        throw new AppError(400, `Prompt must be at most ${MAX_PROMPT_LENGTH} characters`, 'INVALID_INPUT');
      }

      const result = await imageGeneratorService.generateImage(
        prompt.trim(),
        typeof tweetContent === 'string' ? tweetContent.trim() : undefined
      );

      res.json({ success: true, data: result });
    } catch (error) {
      const msg = error instanceof Error ? error.message : '';
      if (msg.startsWith('HF_NOT_CONFIGURED:')) {
        next(new AppError(503, 'HF_API_TOKEN이 설정되지 않았습니다. apps/api/.env 에 추가해주세요. (huggingface.co/settings/tokens 에서 무료 발급)', 'AI_NOT_CONFIGURED'));
        return;
      }
      if (msg.startsWith('HF_AUTH_ERROR:')) {
        next(new AppError(401, 'HF_API_TOKEN이 유효하지 않습니다. huggingface.co/settings/tokens 에서 재발급하세요.', 'AI_AUTH_ERROR'));
        return;
      }
      if (msg.startsWith('RATE_LIMIT:') || msg.includes('rate limit exceeded')) {
        next(new AppError(429, 'AI rate limit reached. Please try again in a minute.', 'RATE_LIMIT'));
        return;
      }
      if (msg.startsWith('MODEL_LOADING:')) {
        next(new AppError(503, msg.replace('MODEL_LOADING: ', ''), 'MODEL_LOADING'));
        return;
      }
      next(error);
    }
  }

  async getGenerations(req: Request, res: Response, next: NextFunction) {
    try {
      const rawLimit = Number(req.query.limit) || 20;
      const rawOffset = Number(req.query.offset) || 0;
      const limit = Math.min(Math.max(1, rawLimit), MAX_GENERATIONS_LIMIT);
      const offset = Math.max(0, rawOffset);

      const [rawItems, total] = await Promise.all([
        ImageGeneration.find()
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit)
          .lean(),
        ImageGeneration.countDocuments(),
      ]);

      const items = rawItems.map((item: any) => ({
        id: item._id.toString(),
        prompt: item.prompt,
        imageUrl: item.imageUrl,
        filename: item.filename,
        tweetContent: item.tweetContent || null,
        createdAt: item.createdAt,
      }));

      res.json({
        success: true,
        data: { items, total, limit, offset },
      });
    } catch (error) {
      next(error);
    }
  }

  async suggestPrompt(req: Request, res: Response, next: NextFunction) {
    try {
      const { tweetContent } = req.body;

      if (!tweetContent || typeof tweetContent !== 'string' || tweetContent.trim().length === 0) {
        throw new AppError(400, 'tweetContent is required', 'INVALID_INPUT');
      }
      if (tweetContent.length > MAX_TWEET_CONTENT_LENGTH) {
        throw new AppError(400, `tweetContent must be at most ${MAX_TWEET_CONTENT_LENGTH} characters`, 'INVALID_INPUT');
      }

      const result = await imageGeneratorService.suggestPrompt(tweetContent.trim());

      res.json({ success: true, data: result });
    } catch (error) {
      const msg = error instanceof Error ? error.message : '';
      if (msg.includes('GEMINI_API_KEY') || msg.includes('not set')) {
        next(new AppError(503, 'AI service is not configured. Set GEMINI_API_KEY in apps/api/.env', 'AI_NOT_CONFIGURED'));
        return;
      }
      next(error);
    }
  }
}

export default new ImageGeneratorController();
