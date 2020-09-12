module.exports = {
  extension: ['ts'],
  spec: 'src/**/*.spec.ts',
  require: `ts-node/register${process.env.VERIFY_TYPES === 'true' ? '' : '/transpile-only'}`
}
