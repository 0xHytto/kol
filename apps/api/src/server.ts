// CRITICAL: Load .env first. Other modules (e.g. config/ai-providers.ts) read process.env
// at import time. With ESM/TS, imports run before other top-level code, so dotenv must
// run via require() here before any import.
const path = require('path');
const fs = require('fs');
const envPath = path.resolve(__dirname, '../.env');
require('dotenv').config({ path: envPath });
// Fallback when run from monorepo root (e.g. yarn dev) where cwd is root
if (!process.env.GEMINI_API_KEY?.trim()) {
  const fallbackPath = path.join(process.cwd(), 'apps', 'api', '.env');
  if (fs.existsSync(fallbackPath)) {
    require('dotenv').config({ path: fallbackPath });
  }
}
if (!process.env.GEMINI_API_KEY?.trim()) {
  console.warn(`[API] GEMINI_API_KEY not set. Tried: ${envPath}`);
}

import app from './app';
import { logger } from './utils/logger';
import { initDatabase } from './config/database';
import { initRedis } from './config/redis';

const PORT = process.env.PORT || 8000;

async function startServer() {
  try {
    // Initialize database connection
    await initDatabase();
    logger.info('Database connected successfully');

    // Initialize Redis connection (optional) - temporarily disabled
    // const redis = await initRedis();
    // if (redis) {
    //   logger.info('Redis connected successfully');
    // } else {
    //   logger.warn('Running without Redis cache');
    // }
    logger.info('Running without Redis cache (disabled for testing)');

    // Start Express server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });

    // Graceful shutdown
    const gracefulShutdown = async () => {
      logger.info('Received shutdown signal, closing server gracefully...');
      server.close(async () => {
        logger.info('HTTP server closed');
        // Close database and Redis connections here
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
