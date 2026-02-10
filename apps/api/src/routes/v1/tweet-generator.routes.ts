import { Router } from 'express';
import tweetGeneratorController from '../../controllers/tweet-generator.controller';

const router = Router();

// Generate tweets
router.post('/generate', tweetGeneratorController.generate.bind(tweetGeneratorController));

// Get user's generation history
router.get('/generations', tweetGeneratorController.getGenerations.bind(tweetGeneratorController));

export default router;
