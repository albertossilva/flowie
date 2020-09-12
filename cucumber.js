const integration = [
  'tests/features',
  `--require-module=ts-node/register${process.env.VERIFY_TYPES === 'true' ? '/transpile-only' : ''}`,
  '--require tests/features/step_definitions/**/*.step.ts',
  '--format summary'
].join(' ')

module.exports = { integration }
