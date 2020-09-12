module.exports = {
  extension: ['ts'],
  spec: 'src/**/*.test.ts',
  require: `ts-node/register${process.env.VERIFY_TYPES === 'true' ? '' : '/transpile-only'}`
}
