import { NextFunction, Request, Response } from 'express';
import { getLogger } from '@jeevesinc/jeeves-telemetry';
import { verifyClientUserRole, verifyClientUserToken } from '@services';
import { isClientUserAuthorized } from '@middlewares';
jest.mock('../../services/auth/auth-service', () => ({
  verifyClientUserToken: jest.fn(),
  verifyClientUserRole: jest.fn(),
}));

describe('Auth middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      context: { logger: getLogger() },
      headers: { 'x-auth-token': 'some-token' },
    };
    mockResponse = {
      setHeader: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should allow client user with allowed role and set response header', async () => {
    const user = { id: 1 };
    const refreshToken = 'valid-refresh-token';
    (verifyClientUserToken as jest.Mock).mockResolvedValue({ user, refreshToken });
    await isClientUserAuthorized()(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.setHeader).toBeCalledTimes(1);
    expect(nextFunction).toBeCalledTimes(1);
  });

  it('should allow client user with allowed role and not set response header', async () => {
    const user = { id: 1 };
    (verifyClientUserToken as jest.Mock).mockResolvedValue({ user });
    await isClientUserAuthorized({ allowedRoles: ['admin'] })(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );
    expect(mockResponse.setHeader).not.toBeCalled();
    expect(nextFunction).toBeCalledTimes(1);
  });

  it('should reject client user with non allowed role', async () => {
    const error = new Error('some error');
    const user = { id: 1 };
    (verifyClientUserToken as jest.Mock).mockResolvedValue({ user });
    (verifyClientUserRole as jest.Mock).mockImplementation(() => {
      throw error;
    });
    await isClientUserAuthorized({ allowedRoles: ['admin'] })(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );
    expect(nextFunction).toBeCalledTimes(1);
    expect(nextFunction).toHaveBeenCalledWith(error);
  });
});
