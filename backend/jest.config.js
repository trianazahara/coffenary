module.exports = {
  testEnvironment: 'node',
  clearMocks: true,
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.js'],
  coverageDirectory: 'coverage',
  "collectCoverage": true,
    "collectCoverageFrom": [
      "controllers/**/*.js",
      "models/**/*.js"
    ],
    "coverageReporters": ["text", "lcov"]
};
