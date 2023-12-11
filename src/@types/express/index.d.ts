import { RequestContext } from '../../types/request-context';

declare global {
  namespace Express {
    interface Request {
      context: RequestContext;
    }
  }
}
