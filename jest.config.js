export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^node-fetch$': '<rootDir>/__mocks__/node-fetch.ts',
  },
};
