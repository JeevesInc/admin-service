import http from 'http';
import { createTerminus } from '@godaddy/terminus';
import config from 'config';

import { dbSequelize as sequelize } from './db/models/sequelize';
import { getLogger } from '@jeevesinc/jeeves-telemetry';
import { createServer } from './server';

const logger = getLogger();

const startServer = async () => {
  const app = createServer();

  try {
    await sequelize.authenticate();
    logger.info(`Connection(${sequelize.getDatabaseName()}) has been established successfully.`);
  } catch (err) {
    logger.error(err, 'Error in connecting to the database');
    throw err;
  }

  const server = http.createServer(app);
  const port = config.get<number>('server.port');

  const beforeShutdown = async () => {
    // given your readiness probes run every 5 second
    return new Promise((resolve) => {
      setTimeout(resolve, 5000);
    });
  };

  // graceful shutdown by handling SIGTERM signal
  createTerminus(server, {
    beforeShutdown,
  });

  server.listen({ port }, () => {
    logger.info(`server start at http://0.0.0.0:${port}`);
  });
};

// start api server
startServer();
