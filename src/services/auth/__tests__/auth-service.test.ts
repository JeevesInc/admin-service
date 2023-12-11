import { AuthenticatedContext, jwtUtils, LoginResponse } from '@jeevesinc/jeeves-auth';
import axios from 'axios';
import { ForbiddenClientUserError, UnauthorizedClientUserError } from '../../../errors/auth-errors';
import { verifyClientUserRole, verifyClientUserToken, verifyCMSUser } from '../auth-service';

describe('AuthService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should verify client user token', async () => {
    const userId = 1;
    const context = new AuthenticatedContext(userId);
    const verifyAndGetContextMock = jest
      .spyOn(jwtUtils, 'verifyAndGetContext')
      .mockReturnValue(context);
    await expect(verifyClientUserToken('some-jwt-token')).resolves.toEqual({
      user: context,
    });
    expect(verifyAndGetContextMock).toBeCalledTimes(1);
  });

  it('should throw error if context is not AuthenticatedContext when verify client user token', async () => {
    const verifyAndGetContextMock = jest
      .spyOn(jwtUtils, 'verifyAndGetContext')
      .mockReturnValue({ id: 1, role: 'admin' });
    await expect(verifyClientUserToken('some-jwt-token')).rejects.toThrowError(
      UnauthorizedClientUserError,
    );
    expect(verifyAndGetContextMock).toBeCalledTimes(1);
  });

  it('should verify legacy client user token', async () => {
    const userId = 1;
    const token = 'some-jwt-token';
    const context = new AuthenticatedContext(
      userId,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      AuthenticatedContext.TOKEN_TYPES.LEGACY,
      null,
      null,
      null,
      null,
      null,
    );
    const verifyAndGetContextMock = jest
      .spyOn(jwtUtils, 'verifyAndGetContext')
      .mockReturnValue(context);
    await expect(verifyClientUserToken(token)).resolves.toEqual({
      user: context,
      refreshToken: token,
    });
    expect(verifyAndGetContextMock).toBeCalledTimes(1);
  });

  it('should verify legacy client user token with a new refresh token', async () => {
    const userId = 1;
    const token = 'some-jwt-token';
    const refreshToken = 'new-refresh-token';
    const requiresNewLegacyTokenAsRefresh = true;
    const context = new AuthenticatedContext(
      userId,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      AuthenticatedContext.TOKEN_TYPES.LEGACY,
      null,
      null,
      null,
      null,
      requiresNewLegacyTokenAsRefresh,
    );
    const verifyAndGetContextMock = jest
      .spyOn(jwtUtils, 'verifyAndGetContext')
      .mockReturnValue(context);
    jest.spyOn(axios, 'post').mockResolvedValue({ data: { some: 'value' } });
    jest.spyOn(LoginResponse, 'builder').mockReturnValue({
      fromPayload: () => ({
        build: () => ({
          token: refreshToken,
        }),
      }),
    });
    await expect(verifyClientUserToken(token)).resolves.toEqual({
      user: context,
      refreshToken,
    });
    expect(verifyAndGetContextMock).toBeCalledTimes(1);
  });

  it('should throw error when token is empty when verifying client user token', async () => {
    await expect(() => verifyClientUserToken(null as unknown as string)).rejects.toThrowError(
      UnauthorizedClientUserError,
    );
  });

  it('should throw error when token is invalid when verifiying client user token', async () => {
    await expect(() =>
      verifyClientUserToken('some-string-masquerading-as-jwt'),
    ).rejects.toThrowError(UnauthorizedClientUserError);
  });

  it('should verify client user role', () => {
    expect(() =>
      verifyClientUserRole(new AuthenticatedContext(1, 'test@tryjeeves.com', 'admin'), ['admin']),
    ).not.toThrowError(ForbiddenClientUserError);
  });

  it('should verify client user role does not match expected', () => {
    expect(() =>
      verifyClientUserRole(new AuthenticatedContext(1, 'test@tryjeeves.com', 'employee'), [
        'admin',
      ]),
    ).toThrowError(ForbiddenClientUserError);
  });

  it('should throw error if allowed roles passed is empty when verifying client user role', () => {
    expect(() =>
      verifyClientUserRole(
        new AuthenticatedContext(1, 'test@tryjeeves.com', 'admin'),
        null as unknown as string[],
      ),
    ).toThrowError(ForbiddenClientUserError);
  });

  it('should throw error when context is empty when verifying client user role', () => {
    expect(() => verifyClientUserRole(null, ['admin'])).toThrowError(ForbiddenClientUserError);
  });

  it('should throw error when context is not instance of authenticated context when verifying client user role', () => {
    expect(() =>
      verifyClientUserRole(
        {
          role: 'admin',
        },
        ['admin'],
      ),
    ).toThrowError(ForbiddenClientUserError);
  });

  it('should throw error when allowed roles are not provided when verifying client user role', () => {
    expect(() =>
      verifyClientUserRole(
        {
          role: 'admin',
        },
        null as never,
      ),
    ).toThrowError(ForbiddenClientUserError);
  });

  it('should throw error when role is not part of the context when verifying client user role', () => {
    expect(() =>
      verifyClientUserRole(
        {
          id: 1,
        },
        ['admin'],
      ),
    ).toThrowError(ForbiddenClientUserError);
  });

  it('should verify cms user', () => {
    const context = new AuthenticatedContext(
      1,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      AuthenticatedContext.TOKEN_TYPES.CMS_ADMIN,
      null,
      null,
      null,
      null,
      null,
    );
    const verifyAndGetContextMock = jest
      .spyOn(jwtUtils, 'verifyAndGetContext')
      .mockReturnValue(context);
    expect(verifyCMSUser('some-jwt-token')).toEqual({
      user: context,
    });
    expect(verifyAndGetContextMock).toBeCalledTimes(1);
  });

  it('should throw error if context is empty when verifying cms user', () => {
    const verifyAndGetContextMock = jest
      .spyOn(jwtUtils, 'verifyAndGetContext')
      .mockReturnValue(null);
    expect(() => verifyCMSUser('some-jwt-token')).toThrowError();
    expect(verifyAndGetContextMock).toBeCalledTimes(1);
  });
});
