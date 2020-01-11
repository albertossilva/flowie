module.exports = {
  env: {
    es6: true,
    es2020: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'standard',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:functional/no-mutations',
    'plugin:functional/no-exceptions',
    'plugin:mocha/recommended',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  plugins: [
    'mocha',
    'import',
    'functional',
    '@typescript-eslint',
  ],
  rules: {
    complexity: ['error', 2],
    'max-params': ['error'],
    'no-param-reassign': ['error'],
    '@typescript-eslint/member-delimiter-style': ['off'],
    '@typescript-eslint/no-use-before-define': ['off'],
    '@typescript-eslint/no-explicit-any': ['off'],
  },
  overrides: [{
    files: ['src/**/*.test.ts'],
    env: {
      mocha: true,
    },
    globals: {
      describe: true,
      it: true,
    },
    rules: {},
  },]
}
