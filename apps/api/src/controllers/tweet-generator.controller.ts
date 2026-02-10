import { Request, Response, NextFunction } from 'express';
import tweetGeneratorService from '../services/tweet/tweet-generator.service';
import { AppError } from '../middleware/error-handler.middleware';

export class TweetGeneratorController {
  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const { kolId, tone, topic, options } = req.body;

      // Validation
      if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
        throw new AppError(400, 'Topic is required', 'INVALID_INPUT');
      }

      if (!tone || !['professional', 'casual', 'hype', 'technical', 'meme'].includes(tone)) {
        throw new AppError(400, 'Valid tone is required', 'INVALID_TONE');
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
      const { limit = 10, offset = 0 } = req.query;

      // TODO: Implement fetching user's generation history
      res.json({
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: Number(limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new TweetGeneratorController();
