import request from 'supertest';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

jest.mock('@jeevesinc/sequelize-db-models');
import { createServer } from '../../../server';
import { models } from '../../../db/jeeves';
jest.mock('@jeevesinc/jeeves-auth');

jest.mock('../../../db/jeeves', () => ({
  sequelize: jest.fn(),
  models: { users: jest.fn() },
}));
jest.mock('../../../db/models', () => ({
  sequelize: jest.fn(),
  models: {},
}));

// mocking middleware
jest.mock('../../../middlewares/auth-middleware', () => ({
  isClientUserAuthorized: () => {
    return async (_req: Request, _res: Response, next: NextFunction) => {
      next();
    };
  },
}));

describe('POST /bar: API', () => {
  let app;
  const token = 'valid-token';

  beforeAll(async () => {
    app = await createServer();
  });

  it('should successfully return data', async () => {
    models.users.findOne = jest.fn().mockResolvedValue({ userId: 1 });

    const res = await request(app)
      .post('/bar')
      .send({ stringInput: 'str', numberInput: 23 })
      .set('x-auth-token', token);
    expect(models.users.findOne).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toEqual(StatusCodes.CREATED);
    expect.objectContaining(res.body);
    expect(res.body).not.toBeNull();
  });

  it('should return 500 if something went wrong', async () => {
    // something went wrong with db unhandled exception
    models.users.findOne = jest.mocked(() => {
      throw new Error('something went wrong');
    });
    const res = await request(app)
      .post('/bar')
      .send({ stringInput: 'str', numberInput: 23 })
      .set('x-auth-token', token);
    expect(res.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect.objectContaining(res.body);
    expect(res.body).not.toBeNull();
  });
});
