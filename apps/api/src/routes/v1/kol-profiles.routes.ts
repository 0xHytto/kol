import { Router } from 'express';
import kolProfileController from '../../controllers/kol-profile.controller';

const router = Router();

// List public KOL profiles
router.get('/', kolProfileController.list.bind(kolProfileController));

// Get specific KOL profile
router.get('/:id', kolProfileController.getById.bind(kolProfileController));

export default router;
