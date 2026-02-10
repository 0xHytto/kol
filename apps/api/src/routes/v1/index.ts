import { Router } from 'express';
import kolProfileRoutes from './kol-profiles.routes';
import tweetGeneratorRoutes from './tweet-generator.routes';

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

// TODO: Add more route handlers
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/image-generator', imageGeneratorRoutes);

export default router;
