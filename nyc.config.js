module.exports = {
  cache: false,
  include: ['src/**/*.ts', 'tests/**/*.ts'],
  exclude: [],
  extension: ['.ts'],
  reporter: ['lcov', 'text', 'text-summary', 'html'],
  all: true,
  checkCoverage: true,
  statements: 100,
  branches: 100,
  functions: 100,
  lines: 100
}
