export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  globalSetup: '<rootDir>/jest/global-setup.js',
  setupFilesAfterEnv: ['<rootDir>/jest/setup-matchers.ts']
};
