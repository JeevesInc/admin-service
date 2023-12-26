const { ENVIRONMENT } = require('../constants');

export const isDevelopment = () => {
  return process.env.NODE_ENV === ENVIRONMENT.DEVELOPMENT;
};

export const isProduction = () => {
  return process.env.NODE_ENV === ENVIRONMENT.PRODUCTION;
};

export const isLocal = () => {
  return process.env.NODE_ENV === ENVIRONMENT.LOCAL;
};
