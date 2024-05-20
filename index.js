const expressServer = require('./lib/expressServer');
const wsServer = require('./lib/wsServer');
const { config } = require('./lib/config');
const { PORT } = config;

wsServer.on('request', expressServer);
wsServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
