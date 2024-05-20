require('dotenv').config();

const { resolve } = require('path');
const { cwd } = require('process');
class Config {
  constructor() {
    this.INFO_LOG = process.env.INFO_LOG || 'access.log';
    this.ERROR_LOG = process.env.ERROR_LOG || 'error.log';
    this.PORT = process.env.PORT || 3000;
    this.BASIC_AUTH = process.env.BASIC_AUTH === 'true';
    this.BASIC_AUTH_USERNAME = process.env.BASIC_AUTH_USERNAME || 'admin';
    this.BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD || 'admin';
    this.CORS = process.env.CORS !== 'false';
    this.CORS_ORIGINS = process.env.CORS_ORIGINS || '';
    this.PRODUCTION = process.env.NODE_ENV === 'production';
    this.DEBUGMODE = process.env.DEBUGMODE === 'true';
    this.infoFilePath = this.getInfoFilePath();
    this.errorFilePath = this.getErrorFilePath();
  }
  logEnvironmentVariables() {
    if (this.DEBUGMODE) {
      const usedEnvVariables = {
        DEBUGMODE: this.DEBUGMODE,
        INFO_LOG: resolve(cwd(), this.INFO_LOG),
        ERROR_LOG: resolve(cwd(), this.ERROR_LOG),
        PORT: this.PORT,
        CORS: this.CORS,
        CORS_ORIGINS: this.CORS_ORIGINS,
        NODE_ENV: this.PRODUCTION ? 'production' : 'development',
        BASIC_AUTH: this.BASIC_AUTH,
        BASIC_AUTH_USERNAME: this.BASIC_AUTH_USERNAME,
        BASIC_AUTH_PASSWORD: this.BASIC_AUTH_PASSWORD,
      };
      console.log('==================== Environment ====================');
      console.log(usedEnvVariables);
      console.log('=======================================================\n');
    }
  }
  getInfoFilePath() {
    return resolve(cwd(), this.INFO_LOG);
  }
  getErrorFilePath() {
    return resolve(cwd(), this.ERROR_LOG);
  }
  changeDebugMode() {
    this.DEBUGMODE = !this.DEBUGMODE;
  }
}

module.exports = {
  config: new Config(),
};
