module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  moduleNameMapper: {
    '^@yurbajs/types$': '<rootDir>/../types/src/index'
  },
  transform: {
    '^.+\.ts$': ['ts-jest', {
      useESM: false
    }]
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts'
  ]
};