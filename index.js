const expressServer = require('./lib/expressServer');
const wsServer = require('./lib/wsServer');
const { config } = require('./lib/config');
const { PORT } = config;
const readline = require('readline');

wsServer.on('request', expressServer);
wsServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`==================== Key Actions ====================`);
  console.log('Press "d" to toggle debug mode');
  console.log('Press "Ctrl + C" to exit');
  console.log('====================================================\n');
});

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
const keyActions = {
  d: () => {
    config.changeDebugMode();
    config.logEnvironmentVariables();
  },
  '\u0003': () => {
    console.log('Exiting...');
    process.exit();
  },
};
process.stdin.on(
  'keypress',
  (str, key) => keyActions[key.sequence] && keyActions[key.sequence]()
);
