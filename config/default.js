module.exports = {
  env: process.env.NODE_ENV,
  server: {
    port: process.env.PORT || 4000,
  },
  log: {
    enabled: true,
    level: 'info',
    loggerExcludeHeaders: ['x-auth-token', 'authorization', 'refresh-token'],
    loggerExcludeReqBodyFields: [],
    prettify: process.env.PRETTIFY_LOG === 'true',
  },
  db: {
    jeeves: {
      username: process.env.JEEVES_MYSQL_USER,
      password: process.env.JEEVES_MYSQL_PASSWORD,
      database: process.env.JEEVES_MYSQL_DATABASE,
      host: process.env.JEEVES_MYSQL_HOST,
    },
    someOtherDb: {
      username: process.env.SOME_OTHER_DB_MYSQL_USER,
      password: process.env.SOME_OTHER_DB_MYSQL_PASSWORD,
      database: process.env.SOME_OTHER_DB_MYSQL_DATABASE,
      host: process.env.SOME_OTHER_DB_MYSQL_HOST,
    },
  },
  auth: {
    authServiceBaseHost: process.env.AUTHENTICATION_SERVICE_BASE_HOST,
    issuer: process.env.JEEVES_JWT_ISSUER,
    audience: process.env.JEEVES_JWT_AUDIENCE,
    publicKeyBase64EncodedInput: process.env.JEEVES_JWT_PUBLIC_KEY_BASE64ENC,
    privateKeyBase64EncodedInput: process.env.JEEVES_JWT_PRIVATE_KEY_BASE64ENC,
  },
  aws: {
    AWS_ENDPOINT: process.env.AWS_ENDPOINT,
    AWS_DEFAULT_REGION: process.env.AWS_DEFAULT_REGION,
  },
  database: {
    username: process.env.JEEVES_MYSQL_USER,
    password: process.env.JEEVES_MYSQL_PASSWORD,
    database: process.env.JEEVES_MYSQL_DATABASE,
    host: process.env.JEEVES_MYSQL_HOST,
    seederStorage: 'sequelize',
    logging: true,
    seederStorageTableName: 'SequelizeSeederMeta',
  },
  mq: {
    EXAMPLE_PROCESS_QUEUE_URL: process.env.EXAMPLE_PROCESS_QUEUE_URL,
    EXAMPLE_PROCESS_DEAD_LETTER_QUEUE_URL: process.env.EXAMPLE_PROCESS_DEAD_LETTER_QUEUE_URL,
  },
  proxy: {
    target: process.env.TARGET_URL,
  },
};
