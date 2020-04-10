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
    complexity: ['error', 4],
    'max-len': ['error', { 'code': 120, 'ignoreComments': true }],
    'no-param-reassign': ['error'],
    '@typescript-eslint/member-delimiter-style': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off'
  },
  overrides: [{
    files: ['src/**/*.ts'],
    env: {},
    globals: {},
    rules: {
      'max-params': ['error', 4],
    },
    extends: [
      'plugin:functional/no-mutations',
      'plugin:functional/no-exceptions',
    ]
  }, {
      files: ['src/compiler/__fixtures__/*.fixture.js'],
      env: {},
      globals: {},
      rules: {
        'max-len': 'off',
        'space-before-function-paren': 'off',
        'camelcase': 'off',
        '@typescript-eslint/camelcase': 'off',
        'semi': 'off',
        'array-bracket-spacing': 'off',
        'comma-dangle': 'off',
      }
    }, {
    files: ['src/**/*.test.ts', 'src/**/*.type-test.ts'],
    env: {
      mocha: true,
    },
    globals: {
      describe: true,
      it: true,
    },
    rules: {
      'no-unused-expressions': 'off',
      'functional/immutable-data': 'off',
    },
  }, {
    files: ['tests/**/*.step.ts'],
    env: {},
    globals: {},
    rules: {
      'no-unused-expressions': 'off',
    },
  }]
}
