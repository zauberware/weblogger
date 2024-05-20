const express = require('express');
const basicAuth = require('express-basic-auth');
const ejs = require('ejs');
const { config } = require('./config');
const { BASIC_AUTH, BASIC_AUTH_USERNAME, BASIC_AUTH_PASSWORD, PORT } = config;

const app = express();

app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

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

app.get('/', (req, res) => {
  res.render('index', {
    websocketUrl: process.env.WEBSOCKET_URL || `ws://localhost:${PORT}`,
  });
});

module.exports = app;
