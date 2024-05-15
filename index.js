require('dotenv').config();
const fs = require('fs');
const readline = require('readline');
const readLastLines = require('read-last-lines');

const ejs = require('ejs');
const express = require('express');
const basicAuth = require('express-basic-auth');

const WebSocket = require('ws');
const http = require('http');
const { resolve } = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const INFO_LOG = process.env.INFO_LOG || 'access.log';
const ERROR_LOG = process.env.ERROR_LOG || 'error.log';
const infoFilePath = resolve(__dirname, INFO_LOG);
const errorFilePath = resolve(__dirname, ERROR_LOG);
const PORT = process.env.PORT || 3000;
const BASIC_AUTH = process.env.BASIC_AUTH === 'true';
const BASIC_AUTH_USERNAME = process.env.BASIC_AUTH_USERNAME || 'admin';
const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD || 'admin';
const CORS = process.env.CORS !== 'false';
const CORS_ORIGINS = process.env.CORS_ORIGINS || '';

const PRODUCTION = process.env.NODE_ENV === 'production';
const DEBUGMODE = process.env.DEBUGMODE === 'true';
if (DEBUGMODE) {
  const usedEnvVariables = {
    DEBUGMODE,
    INFO_LOG: resolve(__dirname, INFO_LOG),
    ERROR_LOG: resolve(__dirname, ERROR_LOG),
    PORT,
    CORS,
    CORS_ORIGINS,
    NODE_ENV: PRODUCTION ? 'production' : 'development',
    BASIC_AUTH,
    BASIC_AUTH_USERNAME,
    BASIC_AUTH_PASSWORD,
  };

  console.log('==================== Environment ====================');
  console.log(usedEnvVariables);
  console.log('=======================================================\n');
}

if (BASIC_AUTH) {
  app.use(
    basicAuth({
      users: {
        [BASIC_AUTH_USERNAME]: BASIC_AUTH_PASSWORD,
      },
      challenge: true,
      realm: 'Weblogger',
    })
  );
}

app.use(express.static('public'));
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

app.get('/', (req, res) => {
  res.render('index', {
    websocketUrl: process.env.WEBSOCKET_URL || `ws://localhost:${PORT}`,
  });
});

wss.on('connection', (ws, req) => {
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
  console.log('Client connected');

  const watchFile = (filePath, type) => {
    let lastPosition = 0;
    const startWatching = () => {
      let buffer = '';
      let timeout = null;
      if (buffer.length < 1) {
        readLastLines
          .read(filePath, 1000)
          .then((lines) => {
            buffer = lines;
            lastPosition = fs.statSync(filePath).size;
            ws.send(JSON.stringify({ type, message: buffer }));
          })
          .catch((err) => {
            console.error(`Error reading file ${filePath}: ${err}`);
          });
      }
      try {
        fs.watch(filePath, (eventType, filename) => {
          if (eventType === 'change') {
            if (timeout) {
              clearTimeout(timeout);
            }
            timeout = setTimeout(() => {
              const rl = readline.createInterface({
                input: fs.createReadStream(filePath, { start: lastPosition }),
              });

              rl.on('line', (line) => {
                lastPosition += Buffer.byteLength(line, 'utf8') + 1; // +1 for the newline character
                ws.send(JSON.stringify({ type, message: line }));
              });

              rl.on('error', (err) => {
                console.error(`Error reading file ${filePath}: ${err}`);
              });
            }, 100); // delay of 100 milliseconds to avoid multiple events
          }
        });
      } catch (err) {
        if (err.code === 'ENOENT') {
          console.error(`File ${filePath} does not exist. Retrying...`);
          setTimeout(startWatching, 1000); // Retry after 1 second if file does not exist because it will be created by fs.open call
        } else {
          throw err;
        }
      }
    };

    fs.open(filePath, 'a', (err, fd) => {
      if (err) throw err;
      fs.close(fd, (err) => {
        if (err) throw err;
        startWatching();
      });
    });
  };

  watchFile(infoFilePath, 'info');
  watchFile(errorFilePath, 'error');
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.info('SIGTERM signal received.');
  console.log('Closing http server.');
  server.close(() => {
    console.log('Http server closed.');
  });
});
