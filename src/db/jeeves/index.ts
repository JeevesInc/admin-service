import sequelizeDb from '@jeevesinc/sequelize-db-models';
import config from 'config';
import commonConstants from '../../constant/common';
import { getLogger } from '@jeevesinc/jeeves-telemetry';

const logger = getLogger();

const dbCreds = config.get<sequelizeDb.DbConfig>('db.jeeves');

let dbConfig = {
  ...dbCreds,
  dialect: 'mysql',
  seederStorage: 'sequelize',
  seederStorageTableName: 'SequelizeSeederMeta',
  logging: logger.info.bind(logger),
  dialectOptions: {
    maxPreparedStatements: 1000,
  },
} as sequelizeDb.DbConfig;

if (config.get('env') === commonConstants.ENVIRONMENT.PRODUCTION) {
  dbConfig = {
    ...dbConfig,
    pool: {
      max: 200,
      min: 0,
      idle: 10000,
    },
    logging: false,
    retry: {
      match: [/Deadlock/i],
      max: 5,
      backoffBase: 1000,
      backoffExponent: 1.5,
    },
  } as sequelizeDb.DbConfig;
}

export const { sequelize, Sequelize } = sequelizeDb.init(dbConfig);

export const models = sequelizeDb.initDbModels(sequelize, Sequelize);
