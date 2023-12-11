import { Logger } from 'pino';
export interface RequestContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any;
  logger: Logger;
}
