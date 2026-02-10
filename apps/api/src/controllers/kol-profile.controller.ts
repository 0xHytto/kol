import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { KolProfile } from '../models/kol-profile.model';
import { AppError } from '../middleware/error-handler.middleware';

/** Escape user input for safe use in MongoDB $regex (prevents ReDoS / regex injection). */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const MAX_LIST_LIMIT = 100;

export class KolProfileController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, limit = 20 } = req.query;
      const cappedLimit = Math.min(Math.max(1, Number(limit) || 20), MAX_LIST_LIMIT);

      let query = KolProfile.find({ isPublic: true })
        .sort({ followerCount: -1 })
        .limit(cappedLimit);

      if (search && typeof search === 'string' && search.trim().length > 0) {
        const safeSearch = escapeRegex(search.trim().slice(0, 100));
        query = query.or([
          { displayName: { $regex: safeSearch, $options: 'i' } },
          { twitterHandle: { $regex: safeSearch, $options: 'i' } },
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
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError(400, 'Invalid KOL profile ID', 'INVALID_ID');
      }

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
