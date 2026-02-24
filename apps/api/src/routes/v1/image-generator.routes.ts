import { Router } from 'express';
import imageGeneratorController from '../../controllers/image-generator.controller';

const router = Router();

// Generate image from prompt (Gemini)
router.post('/generate', imageGeneratorController.generate.bind(imageGeneratorController));

// Suggest a Gemini image prompt based on tweet content
router.post('/suggest-prompt', imageGeneratorController.suggestPrompt.bind(imageGeneratorController));

// Get image generation history
router.get('/generations', imageGeneratorController.getGenerations.bind(imageGeneratorController));

export default router;
