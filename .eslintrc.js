module.exports = {
  env: {
    es6: true,
    es2020: true,
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
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['mocha', 'import', 'functional', '@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    complexity: ['error', 4],
    'comma-dangle': ['error', 'always-multiline'],
    'space-before-function-paren': 'off',
    'generator-star-spacing': 'off',
    'no-param-reassign': ['error'],
    'no-use-before-define': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '_*' }],
    '@typescript-eslint/member-delimiter-style': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
  },
  overrides: [
    {
      files: ['src/**/*.ts'],
      env: {},
      globals: {},
      rules: {
        'max-params': ['error', 4],
      },
      extends: ['plugin:functional/no-mutations', 'plugin:functional/no-exceptions'],
    },
    {
      files: ['src/compiler/__fixtures__/*.fixture.js'],
      env: {},
      globals: {},
      rules: {
        'padded-blocks': 'off',
        'space-before-function-paren': 'off',
        camelcase: 'off',
        '@typescript-eslint/camelcase': 'off',
        semi: 'off',
        'array-bracket-spacing': 'off',
        'comma-dangle': 'off',
      },
    },
    {
      files: ['src/**/__tests__/*.ts', 'tests/features/step_definitions/**/*'],
      env: {
        mocha: true,
      },
      globals: {
        describe: true,
        it: true,
      },
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'no-unused-expressions': 'off',
        'functional/immutable-data': 'off',
      },
    },
    {
      files: ['tests/**/*.step.ts'],
      env: {},
      globals: {},
      rules: {
        'no-unused-expressions': 'off',
      },
    },
  ],
}
