const WebSocket = require('ws');
const http = require('http');
const { config } = require('./config');
const { PORT, CORS, CORS_ORIGINS, PRODUCTION, infoFilePath, errorFilePath } =
  config;

const server = http.createServer();
const wss = new WebSocket.Server({ server });
const watchFile = require('./fileWatcher');
const CLIENTS = new Map();
const { uuid4 } = require('./helper');
wss.uuid = uuid4();
wss.on('connection', (ws, req) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.id && CLIENTS.has(data.id)) {
      console.log(`Existing client reconnected: ${data.id}`);
    } else {
      const id = uuid4();
      CLIENTS.set(id, ws);
      ws.send(JSON.stringify({ id }));
      console.log(`New client connected: ${id}`);
    }
  });

  const origin = req.headers.origin;
  const allowedOrigins = CORS_ORIGINS
    ? CORS_ORIGINS.split(',')
    : [!PRODUCTION ? `http://localhost:${PORT}` : ''];

  if (CORS && allowedOrigins && allowedOrigins.indexOf(origin) === -1) {
    // Close connection if origin is not in the list of allowed origins
    ws.close(1008, 'Connection from origin not allowed');

    console.log(`Connection from origin ${origin} rejected`);
    return;
  }

  watchFile(infoFilePath, 'info', ws);
  watchFile(errorFilePath, 'error', ws);
  console.log('%cCLIENTS:', 'color: lime; font-size: 1.125rem;', CLIENTS);
});

module.exports = server;
