import cors from 'cors';
import path from 'path';
import 'reflect-metadata';
import express from 'express';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import * as swaggerUiExpress from 'swagger-ui-express';
import { defaultMetadataStorage as classTransformerDefaultMetadataStorage } from 'class-transformer/cjs/storage';
import { useExpressServer, getMetadataArgsStorage } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import { getLogger, loggerMiddleware, prometheusMiddleware } from '@jeevesinc/jeeves-telemetry';
import { ValidatorOptions } from 'class-validator';
import bodyParser from 'body-parser';

import routes from './api/routes';

const logger = getLogger();
export const createServer = (): express.Application => {
  const app = express() as express.Application;
  // TODO: change to specific headers/options
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(loggerMiddleware);
  app.use(prometheusMiddleware());

  app.use((req, _res, next) => {
    req.context = {
      logger,
      user: {},
    };
    next();
  });

  app.disable('x-powered-by');

  // monolith routes using express validators
  app.use(routes);

  // routes using decorators
  const routingControllersOptions = {
    controllers: [path.join(__dirname + '/api/**/*controller*')],
    middlewares: [path.join(__dirname + '/middlewares/*')],
    defaultErrorHandler: false,
    // routePrefix: '/api',
  };
  useExpressServer(app, routingControllersOptions);

  // Parse class-validator classes into JSON Schema:
  const schemas = validationMetadatasToSchemas({
    classTransformerMetadataStorage: classTransformerDefaultMetadataStorage,
    refPointerPrefix: '#/components/schemas/',
  }) as { [schema: string]: Partial<ValidatorOptions> };

  // Parse routing-controllers classes into OpenAPI spec:
  const storage = getMetadataArgsStorage();
  const spec = routingControllersToSpec(storage, routingControllersOptions, {
    components: {
      schemas,
      securitySchemes: {
        token: {
          type: 'apiKey',
          name: 'x-auth-token',
          in: 'header',
        },
      },
    },
    info: {
      description: 'Generated with `routing-controllers-openapi`',
      title: 'admin-service API doc',
      version: '1.0.0',
    },
  });

  app.use('/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(spec));

  return app;
};
