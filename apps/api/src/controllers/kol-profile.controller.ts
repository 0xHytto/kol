import { Request, Response, NextFunction } from 'express';
import { KolProfile } from '../models/kol-profile.model';
import { AppError } from '../middleware/error-handler.middleware';

export class KolProfileController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, limit = 20 } = req.query;

      let query = KolProfile.find({ isPublic: true })
        .sort({ followerCount: -1 })
        .limit(Number(limit));

      if (search && typeof search === 'string') {
        query = query.or([
          { displayName: { $regex: search, $options: 'i' } },
          { twitterHandle: { $regex: search, $options: 'i' } },
        ]);
      }

      const kols = await query;

      res.json({
        success: true,
        data: kols,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const kol = await KolProfile.findOne({ _id: id, isPublic: true });

      if (!kol) {
        throw new AppError(404, 'KOL profile not found', 'NOT_FOUND');
      }

      res.json({
        success: true,
        data: kol,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new KolProfileController();
