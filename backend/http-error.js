// @ts-check

/**
 * An error that maps directly onto an HTTP response.
 * Thrown from route handlers and rendered by the error middleware.
 */
export class HttpError extends Error {
  /**
   * @param {number} status
   * @param {string} code     Stable machine-readable code, e.g. "NOT_FOUND".
   * @param {string} message  Human-readable explanation.
   * @param {unknown} [details]
   */
  constructor(status, code, message, details) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
