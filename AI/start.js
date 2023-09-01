const chalk = require('chalk');
const webpack = require('webpack');
const readlineSync = require('readline-sync');
const webpackConfig = require('./webpack.config');
const WebpackDevServer = require('webpack-dev-server');

const defaultPort = 3000;
let port = defaultPort;

// Function to prompt the user for a new port
const promptNewPort = () => {
  const answer = readlineSync.question(`Port ${port} is already in use. Do you want to use the next available port? (Y/N) `);
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
};

// Function to start the server
const startServer = (port) => {
  const compiler = webpack(webpackConfig);
  const devServerOptions = {
    ...webpackConfig.devServer,
    port: port,
    onAfterSetupMiddleware: () => {
      console.clear();
      console.log('Starting development server...');
    },    
  };
  const server = new WebpackDevServer(compiler, devServerOptions);
  server.startCallback(() => {
    console.clear();
    console.log(chalk.green('Compiled successfully!\n'));
    console.log(chalk.white(`You can now view ${chalk.white.bold('vlior')} in the browser.\n`));

    const localUrl = `http://localhost:${port}`;
    const networkUrl = `http://192.168.151.203:${port}`;

    console.log(chalk.white('Local:            ') + chalk.white.bold(localUrl));
    console.log(chalk.white('On Your Network:  ') + chalk.white.bold(networkUrl + '\n'));
    console.log(chalk.white('Note that the development build is not optimized.'));
    console.log(chalk.white('To create a production build, use ') + chalk.blueBright.bold('yarn build.\n'));
    console.log(chalk.greenBright.bold('webpack compiled successfully'));
  });
};

// Function to check if the port is already in use
const checkPortInUse = (port) => {
  return new Promise((resolve, reject) => {
    const net = require('net');
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        reject(err);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port);
  });
};

// Start the server and check if the initial port is already in use
checkPortInUse(port)
  .then((inUse) => {
    if (inUse) {
      const useNextPort = promptNewPort();
      if (useNextPort) {
        port += 1;
        startServer(port);
      } else {
        console.log(`Port ${port} is already in use. Exiting...`);
        process.exit(0);
      }
    } else {
      startServer(port);
    }
  })
  .catch((err) => {
    console.error('An error occurred while checking the port:', err);
    process.exit(1);
  });
