import { NextFunction, Request, Response } from 'express';
import { verifyClientUserRole, verifyClientUserToken } from '@services';
import { IAllowedClientRoles } from '@types';

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
