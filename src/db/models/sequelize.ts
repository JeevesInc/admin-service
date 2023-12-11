import config from 'config';
import { Sequelize } from 'sequelize';

type DbConfig = {
  username: string;
  password: string;
  database: string;
  host: string;
  seederStorage: string;
  logging: boolean;
  seederStorageTableName: string;
};
const dbConfig = config.get<DbConfig>('database');

let sequelize: Sequelize;
const getDbConnection = (): Sequelize => {
  if (sequelize) {
    return sequelize;
  }

  sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    dialect: 'mysql',
    dialectOptions: {},
  });

  return sequelize;
};

export const dbSequelize = getDbConnection();
