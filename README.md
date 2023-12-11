# admin-service.

A Jeeves NodeJS BE service called admin-service.

## Tech stack

- NodeJS LTS (>=18)
- ts-node
- express
- TypeScript
- Jest
- [node-config](https://github.com/node-config)
- [pino](https://github.com/pinojs/pino)
- ts-node
- eslint
- prettier

## Get started

## Install nvm

```bash
$ brew install nvm
```

## Install NodeJS

```bash
$
$ nvm install --lts
$ nvm use ## to use the version set in .nvmrc
```

## Running the app

1. Create .env (requires AWS CLI setup: see the <https://github.com/JeevesInc/local-setup>)

```bash
$ make get_env_file
```

2. Start the app

```bash
$ npm run start
```

### In production:

Run in watch mode

```bash
$ npm run clean
$ npm run build
$ npm run start-prod
```

## Running the workers

```bash
$ npm run start-workers
```

## Test

```bash
$ npm run test
```

# Documentation

- [Code folder structure](#Code-folder-structure)
- [config](#config)
- [routes](#routes)
- [Controllers](#controllers)
- [Services](#services)
- [db models](#db-models)
- [Middlewares](#middlewares)
- [Api documentation](#api-documentation)
- [Api request validations](#api-request-validations)
- [Migrating from existing backend monolith](#migrating-from-existing-backend-monolith)

## Code folder structure

```bash
├── src
│   ├── api
│   │   ├── bar
│   │   │   ├── __tests__
│   │   │   │   └── post-bar.test.ts
│   │   │   └── bar-controller.ts
│   │   ├── foo
│   │   │   ├── __tests__
│   │   │   │   ├── create-foo.test.ts
│   │   │   │   └── get-foo.test.ts
│   │   │   └── foo-controller.ts
│   │   ├── foo-monolith
│   │   │   ├── controllers
│   │   │   │   └── get-foo.ts
│   │   │   └── routes.ts
│   │   ├── health-check
│   │   │   └── controllers
│   │   │       └── health-check-controller.ts
│   │   └── routes.ts
│   ├── constant
│   │   ├── common.ts
│   │   └── http.ts
│   ├── db
│   │   ├── jeeves
│   │   │   └── index.ts
│   │   ├── models
│   │   │   ├── foo-lookup.ts
│   │   │   ├── index.ts
│   │   │   └── sequelize.ts
│   │   └── seeders
│   ├── errors
│   │   ├── auth-errors.ts
│   │   └── request-errors.ts
│   ├── jobs
│   │   └── example-consumer.ts
│   ├── logger.ts
│   ├── main.ts
│   ├── middlewares
│   │   ├── __tests__
│   │   │   └── auth-middleware.test.ts
│   │   └── auth-middleware.ts
│   ├── scripts
│   ├── server.ts
│   ├── services
│   │   ├── auth
│   │   │   ├── __tests__
│   │   │   │   └── auth-service.test.ts
│   │   │   └── auth-service.ts
│   │   ├── bar
│   │   │   └── bar-service.ts
│   │   └── foo
│   │       └── foo-service.ts
│   ├── start-workers.ts
│   ├── types
│   │   ├── auth-types.ts
│   │   ├── authentication-utils-types.ts
│   │   ├── bar-types.ts
│   │   ├── express-types.ts
│   │   └── foo-types.ts
│   └── utils
│       ├── __tests__
│       │   └── some-test.test.ts
│       ├── bar-utils.ts
│       └── string-utils.ts
├──Makefile
├── README.md
├── config
├── coverage
├── dist
├── docker-compose.yml
├── jest.config.js
├── localstack-bootstrap
├── package-lock.json
├── package.json
├── sonar-project.properties
└── tsconfig.json
```

## config

configuration file to set all application configuration values static/ reading from envs/ secrets using node-config.
for the reference checkout the **default.ts** in config directory.
Example:

```ts
export default {
  env: process.env.NODE_ENV,
  server: {
    port: process.env.PORT || 4000,
  },
};
```

you can get the configuration like below:

```ts
import config from 'config';
const port = config.get('server.port');
```

## Routes

Router has to do single task to create api routes and attach controller, not algorithm or any logic implementation.

example:

```ts
// foo.ts routes
import express from 'express';
import { createFoo } from './controllers/create-foo';
import { getFoo } from './controllers/get-foo';

const router = express.Router();

/**
 *
 *
 * */
router.get('/', getFoo);
router.post('/', createFoo);
```

```ts
// bar.ts routes
import express from 'express';
import { createBar } from './controllers/create-bar';
import { getBar } from './controllers/get-bar';

const router = express.Router();

router.get('/', getBar);
router.post('/', createBar);
```

```ts
// add foo route to root router
import { Router } from 'express';

import fooRouter from './foo/routes';
import barRouter from './bar/routes';

rootRouter.use('/foo', fooRouter);
rootRouter.use('/bar', barRouter);

export default rootRouter;
```

## Controllers

Controller to read req params and body and call one or more services and do the needed composition/ massaging to return the response but no business logic should be implemented

example:

```ts
import { Request, Response } from 'express';
import { Body, Get, JsonController, Post, Req, Res, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { getLogger } from '@jeevesinc/jeeves-telemetry';

import { isClientUserAuthorized } from '../../middlewares/auth-middleware';
import { createFooLookUp, getAllFooLookUp } from '../../services/foo/foo-service';
import { FooReqBody, FooResBody, GetFooResBody } from '../../types/foo-types';
import { decodeBase64String } from '../../utils/string-utils';

const logger = getLogger();
@JsonController('/foo')
export class FooController {
  @Post('/')
  @OpenAPI({ summary: 'Create new Foo' })
  @ResponseSchema(FooResBody)
  async createFoo(
    @Body({ required: true }) body: FooReqBody,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await createFooLookUp(body);
      return res.status(201).send({ msg: 'data inserted successfully', status: true, body: body });
    } catch (error) {
      logger.error(error, `Error in createCountryLookUp payload:${JSON.stringify(body)}`);
      return res.status(500).json({
        msg: 'some error occurred',
        status: false,
      });
    }
  }
}
```

## Services

Service consists the business logic and provides the desired data to the controllers.
examples: there are couple of example present in service dirctory.

```ts
import db from '../../db/models';
//  added this to demonstrate the integration tests
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getAllFooLookUp = (userId: number) => {
  return db.models.FooLookUp.findAll({
    // where: { userId },
    attributes: ['numericCode', 'name', 'alpha2Code'],
    raw: true,
  });
};
```

## db models

This is the layer that communicates with the database, we read and write to the database. We typically use an ORM like Sequelize, TypeORM etc. for reference checkout the models folder under the db directory.
example

```ts
import { Model, DataTypes } from 'sequelize';
import { dbSequelize as sequelize } from './sequelize';
export class FooLookUp extends Model {
  public id!: number;
  public name!: string;
  public alpha2Code!: string;
}

FooLookUp.init(
  {
    id: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    alpha2Code: {
      type: DataTypes.CHAR(2),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'foo_model',
    timestamps: true,
    freezeTableName: true,
  },
);

export default FooLookUp;
```

If you want to create a new db model then under the src/db/models directory, create a new file and define the schema that you want to have.

### Migrations

to create a migration just run the below command:-

```bash
npx sequelize migration:generate --name <filename>
```

### Seeders

to create a seeder just run the below command:

```bash
npx sequelize seed:generate --name <filename>
```

### Run the migrations

```bash
npm run db-migrate
```

## Middlewares

Reusable plugins to modify requests typically used for authentication, error handling, etc.
for reference checkout **auth-middleware.ts** file under middlewares directory.
Example:

```ts
export const isClientUserAuthorized = (options: { allowedRoles?: IAllowedClientRoles } = {}) => {
  const { allowedRoles = 'ALL' } = options;
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req?.headers?.['x-auth-token'];
      const { user, refreshToken } = await verifyClientUserToken(token as string);
      verifyClientUserRole(user, allowedRoles);
      req.context.user = user;
      if (refreshToken) {
        res.setHeader('Refresh-Token', refreshToken);
      }
      return next();
    } catch (error) {
      next(error);
    }
  };
};
```

## Api documentation

we are using routing-controllers-openapi to generate the API doc based on Swagger OpenAPI 3.0 and swagger-ui-express for viewing the API documentation.
Example:

```ts
@JsonController('/foo')
export class FooController {
  @Post('/')
  @OpenAPI({ summary: 'Create new Foo' })
  @ResponseSchema(FooResBody)
}
```

## Api request validations

We are using class-validator to validate the request and class-validator-jsonschema Parse class-validator classes into JSON Schema.
example:

```ts
export class FooReqBody {
  @IsString()
  stringInput!: string;
  @IsNumber()
  numberInput!: number;
}

@JsonController('/foo')
export class FooController {
  @Post('/')
  @OpenAPI({ summary: 'Create new Foo' })
  @ResponseSchema(FooResBody)
  async createFoo(
    @Body({ required: true }) body: FooReqBody,
    @Req() req: Request,
    @Res() res: Response,
  ) {}
}
```

# Migrating from existing backend monolith

## Controllers

- Put all controllers into the api directory via creating desired modules e.g. take a look on **foo-monolith** folder.
- create a route file for each modules and import them into routes file under api directory.

## Services

- Create services via creating appropriate folder under services directory for example take a look on **foo-service.ts** file

## db models

for db models we can use sequelize-db-model repo similiar to existing we are using in backend monolith repo. for reference take a look on **jeeves** folder under db directory.

## Middlewares

Create middlewares via creating appropriate folders under middlewares directory.

## Api documentation

- generate swagger doc by refactoring as per the above [Documentation](#api-documentation)

## Api request validations

- continue to use express validator till refactoring as per the [Documentation](#api-request-validations)
