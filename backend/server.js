// @ts-check
/**
 * Process entry point: load configuration, start the HTTP server and shut
 * down gracefully on SIGINT / SIGTERM (e.g. during a container redeploy).
 */
import { createApp } from './app.js';
import { loadConfig } from './config.js';

const config = loadConfig();
const app = createApp(config);

const server = app.listen(config.port, config.host, () => {
  const shownHost = config.host === '0.0.0.0' ? 'localhost' : config.host;
  console.log(`LabhSetu running at http://${shownHost}:${config.port} (${config.env})`);
});

server.on('error', (err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});

/** @param {NodeJS.Signals} signal */
function shutdown(signal) {
  console.log(`${signal} received, shutting down…`);
  server.close(() => process.exit(0));
  // Don't hang forever on keep-alive connections.
  setTimeout(() => process.exit(0), 5000).unref();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
