import {
  AuthenticatedContext,
  jwtUtils,
  LoginResponse,
  RefreshTokenRequest,
} from '@jeevesinc/jeeves-auth';
import axios from 'axios';
import config from 'config';
import { getLogger } from '@jeevesinc/jeeves-telemetry';

import {
  ForbiddenClientUserError,
  UnauthorizedClientUserError,
  UnauthorizedCMSUserError,
} from '@errors';
import { IAllowedClientRoles } from '@types';

const logger = getLogger();

jwtUtils.init(
  config.get('auth.issuer'),
  config.get('auth.audience'),
  config.get('auth.publicKeyBase64EncodedInput'),
  config.get('auth.privateKeyBase64EncodedInput'),
);

const callAuthenticationService = async (endpoint: string, data: object) => {
  return axios.post(`${config.get('auth.authServiceBaseHost')}${endpoint}`, data, {
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const verifyClientUserToken = async (token: string) => {
  if (!token) {
    throw new UnauthorizedClientUserError('JWT token not found');
  }

  const context = jwtUtils.verifyAndGetContext(token, logger);

  if (!context) {
    throw new UnauthorizedClientUserError('Context not found from JWT');
  }

  if (!(context instanceof AuthenticatedContext)) {
    throw new UnauthorizedClientUserError('Context is not instance of AuthenticatedContext');
  }

  if (context.tokenType === AuthenticatedContext.TOKEN_TYPES.LEGACY) {
    if (context.requiresNewLegacyTokenAsRefresh) {
      const req = RefreshTokenRequest.builder()
        .withEmail(context.email)
        .withSessionId(context.sessionId)
        .withTokenType(context.tokenType)
        .build();

      const axiosResponse = await callAuthenticationService('/refresh', req);

      const refreshResponse = LoginResponse.builder().fromPayload(axiosResponse.data).build();

      return { user: context, refreshToken: refreshResponse.token };
    } else {
      return { user: context, refreshToken: token };
    }
  }

  return { user: context };
};

export const verifyClientUserRole = (
  context: typeof AuthenticatedContext,
  allowedRoles: IAllowedClientRoles,
) => {
  if (!context) {
    throw new ForbiddenClientUserError('Context not found');
  }

  if (!(context instanceof AuthenticatedContext)) {
    throw new ForbiddenClientUserError('Context is not instance of AuthenticatedContext');
  }

  if (!allowedRoles) {
    throw new ForbiddenClientUserError('Allowed roles not provided');
  }

  if (allowedRoles !== 'ALL' && !allowedRoles.includes(context.role)) {
    throw new ForbiddenClientUserError(
      `Expected role one of [${allowedRoles.join(',')}], found ${context.role}`,
    );
  }
};

export const verifyCMSUser = (token: string) => {
  const context = jwtUtils.verifyAndGetContext(token, logger);
  if (
    !(
      context &&
      context instanceof AuthenticatedContext &&
      context.tokenType === AuthenticatedContext.TOKEN_TYPES.CMS_ADMIN &&
      context.userId
    )
  ) {
    throw new UnauthorizedCMSUserError('Context is invalid');
  }
  return { user: context };
};
