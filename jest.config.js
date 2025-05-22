// jest.config.js
module.exports = {
  testEnvironment: 'jsdom', 
  setupFiles: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  moduleNameMapper: {
    '^chrome$': '<rootDir>/__mocks__/chrome.js',
    '^browser$': '<rootDir>/__mocks__/chrome.js',
  },
};

  