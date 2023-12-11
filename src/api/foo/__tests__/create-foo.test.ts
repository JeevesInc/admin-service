import request from 'supertest';
import { createServer } from '../../../server';
import { StatusCodes } from 'http-status-codes';
import { FooLookUp } from '@models';

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

describe('POST /foo: API', () => {
  let app;
  const token = 'valid-token';

  beforeAll(async () => {
    app = await createServer();
  });

  it('should successfully create /foo', async () => {
    FooLookUp.create = jest.fn();
    const res = await request(app)
      .post('/foo')
      .send({ stringInput: 'str', numberInput: 23 })
      .set('x-auth-token', token);
    expect(FooLookUp.create).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toEqual(StatusCodes.CREATED);
    expect.objectContaining(res.body);
    expect(res.body).not.toBeNull();
    expect(res.body.status).toBeTruthy();
  });

  it('should return 500 if something went wrong', async () => {
    FooLookUp.create = jest.mocked(() => {
      throw new Error('something went wrong');
    });
    const res = await request(app)
      .post('/foo')
      .send({ stringInput: 'str', numberInput: 23 })
      .set('x-auth-token', token);
    expect(res.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect.objectContaining(res.body);
    expect(res.body).not.toBeNull();
    expect(res.body.status).toBeFalsy();
  });
});
