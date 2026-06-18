import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';

const app = express();

// Security Middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      const cleanOrigin = origin.replace(/\/$/, '');
      const cleanFrontendUrl = config.FRONTEND_URL.replace(/\/$/, '');
      const isLocal = cleanOrigin.startsWith('http://localhost:') || cleanOrigin.startsWith('http://127.0.0.1:');
      if (cleanOrigin === cleanFrontendUrl || isLocal || config.FRONTEND_URL === '*') {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: config.NODE_ENV,
  });
});

import authRoutes from './modules/auth/auth.routes';
import activityRoutes from './modules/activity/activity.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import insightsRoutes from './modules/insights/insights.routes';
import goalsRoutes from './modules/goals/goals.routes';
import gamificationRoutes from './modules/gamification/gamification.routes';
import { errorHandler } from './middleware/errorHandler';

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/activities', activityRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/insights', insightsRoutes);
app.use('/api/v1/goals', goalsRoutes);
app.use('/api/v1/gamification', gamificationRoutes);

// Error Handler
app.use(errorHandler);

export { app };
