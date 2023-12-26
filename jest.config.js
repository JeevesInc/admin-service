module.exports = {
  roots: ['<rootDir>/src/'],
  setupFiles: ['<rootDir>/.jest/setup-tests.js'],
  testMatch: ['**/__tests__/**/*.+(ts|js)', '**/?(*.)+(spec|test).+(ts|js)'],
  transform: {
    '^.+\\.(ts)$': 'ts-jest',
  },
  resetMocks: true,
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: [
    'src/constants/',
    'src/db/',
    'src/main.ts',
    'src/start-workers.ts',
    'src/jobs/example-consumer.ts',
  ],
  coverageThreshold: {
    global: {
      lines: 100,
      branches: 100,
      functions: 100,
      statements: 100,
    },
  },
  moduleNameMapper: {
    '^@constants': '<rootDir>/src/constants/index',
    '^@errors': '<rootDir>/src/errors/index',
    '^@middlewares': '<rootDir>/src/middlewares/index',
    '^@models': '<rootDir>/src/db/models/index',
    '^@repositories': '<rootDir>/src/db/models/repository/index',
    '^@jeeves-repositories': '<rootDir>/src/db/jeeves/repository/index',
    '^@services': '<rootDir>/src/services/index',
    '^@types': '<rootDir>/src/types/index',
    '^@utils': '<rootDir>/src/utils/index',
  },
};
