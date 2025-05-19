export default {
  preset: 'jest-puppeteer',
  roots: ['<rootDir>/specs'],
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {},
}