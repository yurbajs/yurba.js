module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  moduleNameMapper: {
    '^@yurbajs/types$': '<rootDir>/../types/src/index',
    '^@yurbajs/rest$': '<rootDir>/../rest/src/index',
    '^@yurbajs/ws$': '<rootDir>/../ws/src/index',
  },
  transform: {
    '^.+\.ts$': ['ts-jest', {
      useESM: false,
    }],
  },
};
