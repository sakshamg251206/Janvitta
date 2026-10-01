// @ts-check
/**
 * Runtime configuration, read once from environment variables.
 * Invalid values fail fast at startup rather than surfacing later.
 */

/**
 * @typedef {object} Config
 * @property {'development' | 'production' | 'test'} env
 * @property {string} host
 * @property {number} port
 * @property {string[] | '*'} corsOrigins   Origins allowed to call the API from a browser.
 * @property {number} rateLimitWindowMs
 * @property {number} rateLimitMax          Requests per window per client IP.
 * @property {number | boolean | string} trustProxy  Passed to Express' "trust proxy" setting.
 */

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {Config}
 */
export function loadConfig(env = process.env) {
  const nodeEnv = env.NODE_ENV ?? 'development';
  if (nodeEnv !== 'development' && nodeEnv !== 'production' && nodeEnv !== 'test') {
    throw new Error(`NODE_ENV must be development, production or test (got "${nodeEnv}").`);
  }

  return {
    env: nodeEnv,
    host: env.HOST || '0.0.0.0',
    port: readInt(env, 'PORT', 3000, { min: 0, max: 65535 }),
    corsOrigins: parseOrigins(env.CORS_ORIGINS),
    rateLimitWindowMs: readInt(env, 'RATE_LIMIT_WINDOW_MS', 60_000, { min: 1000 }),
    rateLimitMax: readInt(env, 'RATE_LIMIT_MAX', 60, { min: 1 }),
    trustProxy: parseTrustProxy(env.TRUST_PROXY),
  };
}

/**
 * @param {NodeJS.ProcessEnv} env
 * @param {string} name
 * @param {number} fallback
 * @param {{ min?: number, max?: number }} [bounds]
 */
function readInt(env, name, fallback, { min = -Infinity, max = Infinity } = {}) {
  const raw = env[name];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max} (got "${raw}").`);
  }
  return value;
}

/**
 * Empty means same-origin only (the bundled frontend needs no CORS).
 * @param {string | undefined} raw
 * @returns {string[] | '*'}
 */
function parseOrigins(raw) {
  const value = raw?.trim() ?? '';
  if (value === '*') return '*';
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

/**
 * Accepts a hop count ("1"), a boolean, or an address/subnet list.
 * Defaults to off, which is correct when the app is not behind a proxy.
 * @param {string | undefined} raw
 */
function parseTrustProxy(raw) {
  if (raw === undefined || raw === '' || raw === 'false') return false;
  if (raw === 'true') return true;
  if (/^\d+$/.test(raw)) return Number(raw);
  return raw;
}
