/* eslint-disable mocha/no-top-level-hooks */
/* eslint-disable mocha/no-hooks-for-single-case */
import { before } from 'mocha'
import { setSeed } from '../../tests/seed'
import compileDots from '../compiler/dot/compileDots'

before(async function () {
  setSeed()
  await compileDots()
})
