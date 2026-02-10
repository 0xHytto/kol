import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import tweetGeneratorService from '../services/tweet/tweet-generator.service';
import { AppError } from '../middleware/error-handler.middleware';

const MAX_TOPIC_LENGTH = 2000;
const MAX_GENERATIONS_LIMIT = 50;

export class TweetGeneratorController {
  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const { kolId, tone, topic, options } = req.body;

      // Validation
      if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
        throw new AppError(400, 'Topic is required', 'INVALID_INPUT');
      }
      if (topic.length > MAX_TOPIC_LENGTH) {
        throw new AppError(400, `Topic must be at most ${MAX_TOPIC_LENGTH} characters`, 'INVALID_INPUT');
      }

      if (!tone || !['professional', 'casual', 'hype', 'technical', 'meme'].includes(tone)) {
        throw new AppError(400, 'Valid tone is required', 'INVALID_TONE');
      }

      if (kolId != null && (typeof kolId !== 'string' || !mongoose.Types.ObjectId.isValid(kolId))) {
        throw new AppError(400, 'Invalid KOL profile ID', 'INVALID_KOL_ID');
      }

      // Get user ID from auth middleware (placeholder for now)
      const userId = (req as any).user?.id || 'anonymous';

      const result = await tweetGeneratorService.generateTweets({
        userId,
        kolId,
        tone,
        topic,
        options,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getGenerations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id || 'anonymous';
      const rawLimit = Number(req.query.limit) || 10;
      const rawOffset = Number(req.query.offset) || 0;
      const limit = Math.min(Math.max(1, rawLimit), MAX_GENERATIONS_LIMIT);
      const offset = Math.max(0, rawOffset);

      // TODO: Implement fetching user's generation history
      res.json({
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: limit,
          offset,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new TweetGeneratorController();
