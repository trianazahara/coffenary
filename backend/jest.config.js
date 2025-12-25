module.exports = {
  testEnvironment: 'node',
  clearMocks: true,
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.js'],
  coverageDirectory: 'coverage',
  verbose: true,
  collectCoverage: false,
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js'
  ],
  coverageReporters: ['text', 'lcov']
};
