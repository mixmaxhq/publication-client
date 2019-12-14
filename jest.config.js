const jestCoverageConfig = require('@mixmaxhq/jest-coverage-config');
const jestJunitConfig = process.env.CI && require('@mixmaxhq/jest-junit-config');

module.exports = {
  testEnvironment: 'node',
  clearMocks: true,
  ...jestCoverageConfig,
  collectCoverageFrom: ['<rootDir>/src/**/*.js'],
  ...jestJunitConfig,
};
