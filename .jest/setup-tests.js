require('reflect-metadata');
require('dotenv').config({ path: './.env' });

jest.mock('sequelize');

jest.mock('../src/db/models/sequelize.ts', () => {
  return {
    dbSequelize: {
      transaction: (callback) => {
        if (callback) {
          return Promise.resolve(callback(jest.fn()));
        } else {
          return {
            commit: jest.fn(),
            rollback: jest.fn(),
          };
        }
      },
    },
  };
});

jest.mock('../src/db/models', () => ({
  sequelize: jest.fn(),
  models: jest.fn(),
}));
