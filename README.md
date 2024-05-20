# Weblogger

This is a Node.js application that uses Express.js for the server, WebSocket for real-time communication, and EJS for rendering HTML. The main purpose of this application is to make log files accessible over HTTP.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js
- yarn or npm

### Installing

1. Clone the repository

   ```bash
   git clone git@github.com:zauberware/weblogger.git
   ```

2. Navigate into the cloned repository

   ```bash
   cd weblogger
   ```

3. Install the dependencies

   ```bash
   yarn install
   ```

4. Start the server
   ```bash
   yarn start # or yarn dev to start with nodemon
   ```

The server will start on port 3000, or on the port specified in your environment variables.

## Usage

The application serves static files from the `public` directory. You can access these files by navigating to `http://localhost:3000/<filename>`.

The main feature of this application is the ability to view log files over HTTP. The application reads from two log files: `access.log` and `error.log`. These file paths can be configured using the `INFO_LOG` and `ERROR_LOG` environment variables, respectively.

**Note:** The server requires read and write permissions on the `error.log` and `access.log` files.

## Production

For production environments, we recommend using [PM2](https://pm2.keymetrics.io/), a production process manager for Node.js applications.

### Installing PM2

You can install PM2 globally on your system by running the following command:

```
npm install pm2 -g
```

### Running the Application with PM2

Once PM2 is installed, you can start your application with the following command:

```
pm2 start app.js
```

Replace `app.js` with the entry point to your application if it's different.

### Other Useful PM2 Commands

- To view the status of your applications:

  ```
  pm2 status
  ```

- To restart an application:

  ```
  pm2 restart app_name_or_id
  ```

- To stop an application:

  ```
  pm2 stop app_name_or_id
  ```

- To view detailed metrics and logs for your application:

  ```
  pm2 monit
  ```

Remember to replace `app_name_or_id` with the name or id of your application as listed in `pm2 status`.

For more information on how to use PM2, refer to the [official PM2 documentation](https://pm2.keymetrics.io/docs/usage/quick-start/).

## Nginx Reverse Proxy Configuration

For production environments, we recommend using Nginx as a reverse proxy for your application. Here's a basic configuration that you can use:

```
server {
    listen 80;
    server_name logs.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

}
```

Replace `yourdomain.com` with your actual domain name and `http://localhost:3000` with the URL where your application is running.

This configuration tells Nginx to listen on port 80 for incoming connections for `yourdomain.com` and to forward those connections to your application running on `http://localhost:3000`.

Remember to reload or restart Nginx after you make changes to the configuration:

```
sudo systemctl reload nginx
```

For more information on how to configure Nginx, refer to the [official Nginx documentation](http://nginx.org/en/docs/).

## Configuration

| Config Variable       | Default Value              | Description                                                                                                     |
| --------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `PORT`                | `3000`                     | The port on which the server will run.                                                                          |
| `INFO_LOG`            | `'access.log'`             | The path to the access log file.                                                                                |
| `ERROR_LOG`           | `'error.log'`              | The path to the error log file.                                                                                 |
| `WEBSOCKET_URL`       | `'ws://localhost:${PORT}'` | The URL for the WebSocket connection.                                                                           |
| `BASIC_AUTH`          | `false`                    | Enable or disable basic authentication.                                                                         |
| `BASIC_AUTH_USERNAME` | `admin`                    | The username for basic authentication.                                                                          |
| `BASIC_AUTH_PASSWORD` | `admin`                    | The password for basic authentication.                                                                          |
| `NODE_ENV`            | `'development'`            | The environment in which the server is running. Can be `'development'`, `'production'`, etc.                    |
| `CORS`                | `true`                     | Enable or disable CORS.                                                                                         |
| `CORS_ORIGINS`        | `undefined`                | Comma-separated list of allowed origins. If not defined and NODE_ENV is 'development', all origins are allowed. |
| `DEBUGMODE`           | `false`                    | Enable or disable debug mode.                                                                                   |

## Built With

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/) - Web framework for Node.js
- [express-basic-auth](https://www.npmjs.com/package/express-basic-auth) - Simple username and password authentication for Express.js
- [WebSocket](https://www.npmjs.com/package/ws) - WebSocket implementation for Node.js
- [EJS](https://ejs.co/) - Embedded JavaScript templating
- [CORS](https://www.npmjs.com/package/cors)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [read-last-lines](https://www.npmjs.com/package/read-last-lines)

## Credits

The favicon for this application was generated using the following graphics from Twitter Twemoji:

- Graphics Title: `1f5d2.svg`
- Graphics Author: Copyright 2020 Twitter, Inc and other contributors. Graphics Source can be found [here](https://github.com/twitter/twemoji/blob/master/assets/svg/1f5d2.svg).
- Graphics License: [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

Built with ❤️ by [zauberware technologies](https://zauberware.com)
