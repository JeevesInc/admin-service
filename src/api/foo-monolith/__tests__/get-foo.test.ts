import request from 'supertest';
import { createServer } from '../../../server';
import { FooLookUp } from '@models';
import { NextFunction } from 'express';

jest.mock('@jeevesinc/sequelize-db-models');
jest.mock('../../../../config/default', () => ({
  server: jest.fn(),
}));
jest.mock('@jeevesinc/jeeves-auth');
jest.mock('../../../db/models', () => ({
  sequelize: jest.fn(),
  FooLookUp: jest.fn(),
}));
jest.mock('../../../db/jeeves', () => ({
  sequelize: jest.fn(),
  models: {},
}));
jest.mock('../../../middlewares/auth-middleware', () => ({
  isClientUserAuthorized: () => {
    return async (_req: Request, _res: Response, next: NextFunction) => {
      next();
    };
  },
}));

describe('GET /foo-monolith: API', () => {
  let app;
  const token = 'valid-token';

  beforeAll(async () => {
    app = await createServer();
  });

  it('should return foo data', async () => {
    FooLookUp.findAll = jest.fn().mockReturnValue([
      {
        numericCode: 4,
        name: 'Afghanistan',
        alpha2Code: 'AF',
      },
      {
        numericCode: 12,
        name: 'Algeria',
        alpha2Code: 'DZ',
      },
    ]);

    const res = await request(app).get('/foo-monolith').set('x-auth-token', token);
    expect(FooLookUp.findAll).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toEqual(200);
    expect.objectContaining(res.body);
    expect(res.body).not.toBeNull();
    expect(res.body.status).toBeTruthy();
  });

  it('should return 500 if something went wrong', async () => {
    FooLookUp.findAll = jest.mocked(() => {
      throw new Error('something went wrong');
    });
    const res = await request(app).get('/foo-monolith').set('x-auth-token', token);
    expect(res.statusCode).toEqual(500);
    expect.objectContaining(res.body);
    expect(res.body).not.toBeNull();
    expect(res.body.status).toBeFalsy();
  });
});
