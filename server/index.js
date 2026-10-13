import { createServer } from 'node:http';
import { getServerConfig } from './config.js';
import { createApp } from './app.js';

const config = getServerConfig();
const app = createApp({ config });
const server = createServer(app);

const host = process.env.HOST || '127.0.0.1';
server.listen(config.port, host, () => {
  console.log(`Chat API (${config.provider}) listening on ${host}:${config.port}`);
});
