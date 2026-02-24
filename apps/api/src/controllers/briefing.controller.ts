import { Request, Response, NextFunction } from 'express';
import { format } from 'date-fns';
import researchAgentService from '../services/agent/research-agent.service';
import contentAgentService from '../services/agent/content-agent.service';
import { DailyBriefing } from '../models/daily-briefing.model';
import { DailyResearch } from '../models/daily-research.model';
import { AppError } from '../middleware/error-handler.middleware';
import { logger } from '../utils/logger';
import { runDailyBriefing } from '../jobs/daily-briefing.job';

export class BriefingController {
  /**
   * GET /briefing — 최신 브리핑 조회
   */
  async getLatest(req: Request, res: Response, next: NextFunction) {
    try {
      const briefing = await DailyBriefing.findOne({ status: 'completed' })
        .sort({ date: -1 })
        .lean();

      if (!briefing) {
        return res.json({
          success: true,
          data: null,
          message: 'No briefing available yet. Trigger one via POST /briefing/trigger.',
        });
      }

      res.json({ success: true, data: briefing });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /briefing/history — 브리핑 히스토리 목록
   */
  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Math.min(Number(req.query.limit) || 10, 30);
      const offset = Math.max(Number(req.query.offset) || 0, 0);

      const [items, total] = await Promise.all([
        DailyBriefing.find({ status: 'completed' })
          .sort({ date: -1 })
          .skip(offset)
          .limit(limit)
          .select('date status items.issue.title items.status createdAt')
          .lean(),
        DailyBriefing.countDocuments({ status: 'completed' }),
      ]);

      res.json({
        success: true,
        data: { items, total, limit, offset },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /briefing/:date — 특정 날짜 브리핑 조회 (YYYY-MM-DD)
   */
  async getByDate(req: Request, res: Response, next: NextFunction) {
    try {
      const { date } = req.params;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new AppError(400, 'Date must be in YYYY-MM-DD format', 'INVALID_DATE');
      }

      const briefing = await DailyBriefing.findOne({ date }).lean();
      if (!briefing) {
        throw new AppError(404, `No briefing found for ${date}`, 'NOT_FOUND');
      }

      res.json({ success: true, data: briefing });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /briefing/trigger — 수동 실행 (개발/테스트용)
   */
  async trigger(req: Request, res: Response, next: NextFunction) {
    try {
      const date = req.body?.date ?? format(new Date(), 'yyyy-MM-dd');

      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new AppError(400, 'date must be in YYYY-MM-DD format', 'INVALID_DATE');
      }

      // 비동기로 실행 — 즉시 응답 반환
      logger.info(`Manual briefing trigger for ${date}`);

      // 백그라운드 실행
      (async () => {
        try {
          const research = await researchAgentService.runDailyResearch(date);
          await contentAgentService.runContentGeneration(research);
          logger.info(`Manual briefing completed for ${date}`);
        } catch (err) {
          logger.error(`Manual briefing failed for ${date}:`, err);
        }
      })();

      res.json({
        success: true,
        message: `Briefing job triggered for ${date}. Check GET /briefing or /briefing/${date} for results.`,
        data: { date },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new BriefingController();
