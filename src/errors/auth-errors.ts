import { StatusCodes } from 'http-status-codes';
import { RequestError } from './request-errors';

export class UnauthorizedClientUserError extends RequestError {
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED;
    this.name = 'UnauthorizedClientUserError';
  }
}

export class ForbiddenClientUserError extends RequestError {
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.FORBIDDEN;
    this.name = 'ForbiddenClientUserError';
  }
}

export class UnauthorizedCMSUserError extends RequestError {
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED;
    this.name = 'UnauthorizedCMSUserError';
  }
}
