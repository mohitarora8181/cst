import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';
import { createApp } from './app.js';

async function start() {
  await connectDB();
  const server = createApp().listen(env.port, () => {
    console.log(`[api] CastLab API listening on http://localhost:${env.port}/api`);
  });

  const shutdown = (signal) => {
    console.log(`[api] ${signal} received, shutting down`);
    server.close(() => disconnectDB().finally(() => process.exit(0)));
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((err) => {
  console.error('[api] failed to start', err);
  process.exit(1);
});
