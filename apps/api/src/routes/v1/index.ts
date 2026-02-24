import { Router } from 'express';
import kolProfileRoutes from './kol-profiles.routes';
import tweetGeneratorRoutes from './tweet-generator.routes';
import imageGeneratorRoutes from './image-generator.routes';
import briefingRoutes from './briefing.routes';

const router = Router();

// Health check
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'API v1 is working',
    data: {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    },
  });
});

// Routes
router.use('/kol-profiles', kolProfileRoutes);
router.use('/tweet-generator', tweetGeneratorRoutes);
router.use('/image-generator', imageGeneratorRoutes);
router.use('/briefing', briefingRoutes);

// TODO: Add more route handlers
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);

export default router;
