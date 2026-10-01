// @ts-check
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import { apiNotFound, errorHandler } from './middleware/errors.js';
import { schemesRouter } from './routes/schemes.js';

/** @typedef {import('./config.js').Config} Config */

const FRONTEND_DIR = fileURLToPath(new URL('../frontend', import.meta.url));

/**
 * Build the Express application. Kept separate from `listen()` so tests can
 * run it on an ephemeral port.
 *
 * @param {Config} config
 */
export function createApp(config) {
  const app = express();
  app.set('trust proxy', config.trustProxy);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'"],
          'style-src': ["'self'", 'https://fonts.googleapis.com'],
          'font-src': ["'self'", 'https://fonts.gstatic.com'],
          'img-src': ["'self'", 'data:'],
          'connect-src': ["'self'"],
          // Only force HTTPS where the app is actually served over HTTPS.
          'upgrade-insecure-requests': config.env === 'production' ? [] : null,
        },
      },
    }),
  );

  if (config.env !== 'test') app.use(requestLogger);

  app.get('/health', (_req, res) => {
    res.set('Cache-Control', 'no-store').json({ status: 'ok' });
  });

  const api = express.Router();
  api.use(
    cors({
      origin: config.corsOrigins === '*' ? '*' : config.corsOrigins.length > 0 ? config.corsOrigins : false,
      methods: ['GET', 'POST'],
    }),
  );
  api.use(
    rateLimit({
      windowMs: config.rateLimitWindowMs,
      limit: config.rateLimitMax,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      handler: (_req, res) => {
        res.status(429).json({ error: { code: 'RATE_LIMITED', message: 'Too many requests. Please slow down.' } });
      },
    }),
  );
  api.use(express.json({ limit: '10kb' }));
  api.use(schemesRouter);
  api.use(apiNotFound);
  app.use('/api/v1', api);

  app.use(
    express.static(FRONTEND_DIR, {
      maxAge: config.env === 'production' ? '1h' : 0,
      setHeaders(res, filePath) {
        // Always revalidate the HTML shell so new releases are picked up immediately.
        if (path.extname(filePath) === '.html') res.setHeader('Cache-Control', 'no-cache');
      },
    }),
  );

  app.use(errorHandler);
  return app;
}

/**
 * One line per request. Logs only method, path, status and timing — never
 * request bodies, which may contain personal details.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    const pathname = req.originalUrl.split('?')[0];
    console.log(`${req.method} ${pathname} ${res.statusCode} ${ms.toFixed(1)}ms`);
  });
  next();
}
