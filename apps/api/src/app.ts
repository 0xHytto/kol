import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import routes from './routes';
import { errorHandler } from './middleware/error-handler.middleware';
import { logger } from './utils/logger';

const app = express();

// Security middleware
app.use(helmet());
const corsOrigin = process.env.CORS_ORIGIN || '';
const isDev = process.env.NODE_ENV === 'development';
const corsOptions: cors.CorsOptions = {
  origin: (origin, cb) => {
    const allow = (ok: boolean) => (ok ? cb(null, true) : cb(new Error('Not allowed by CORS')));
    if (!origin) return allow(true);
    if (isDev && /^http:\/\/localhost(:\d+)?$/.test(origin)) return allow(true);
    if (corsOrigin.includes(',')) {
      return allow(corsOrigin.split(',').map((o) => o.trim()).includes(origin));
    }
    allow(origin === (corsOrigin || 'http://localhost:3000'));
  },
  credentials: true,
};
app.use(cors(corsOptions));

// Rate limiting (abuse / DoS mitigation)
const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // 15 min
const rateLimitMax = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;
app.use(
  rateLimit({
    windowMs: rateLimitWindowMs,
    max: rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' } },
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) },
    })
  );
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Resource not found',
    },
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
