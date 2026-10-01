// @ts-check
import { HttpError } from '../http-error.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */

/**
 * Fallback for unknown API routes. Mounted after all API routers.
 * @param {Request} req
 */
export function apiNotFound(req) {
  throw new HttpError(404, 'NOT_FOUND', `No route for ${req.method} ${req.originalUrl}.`);
}

/**
 * Render every error as `{ error: { code, message, details? } }`.
 * Unexpected errors are logged and reported as a generic 500 so internals
 * never leak to clients.
 *
 * @param {unknown} err
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const error = toHttpError(err);
  if (error.status >= 500) console.error(`[error] ${req.method} ${req.originalUrl}`, err);

  res.status(error.status).json({
    error: {
      code: error.code,
      message: error.message,
      ...(error.details === undefined ? {} : { details: error.details }),
    },
  });
}

/**
 * @param {unknown} err
 * @returns {HttpError}
 */
function toHttpError(err) {
  if (err instanceof HttpError) return err;

  // Errors raised by express.json() (body-parser) carry a `type` and `status`.
  const type = typeof err === 'object' && err !== null && 'type' in err ? err.type : undefined;
  if (type === 'entity.parse.failed') return new HttpError(400, 'INVALID_JSON', 'Request body is not valid JSON.');
  if (type === 'entity.too.large') return new HttpError(413, 'PAYLOAD_TOO_LARGE', 'Request body is too large.');
  if (type === 'encoding.unsupported' || type === 'charset.unsupported') {
    return new HttpError(415, 'UNSUPPORTED_ENCODING', 'Request body encoding is not supported.');
  }

  return new HttpError(500, 'INTERNAL_ERROR', 'Something went wrong on our side. Please try again.');
}
