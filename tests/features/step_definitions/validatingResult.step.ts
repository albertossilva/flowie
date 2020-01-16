import { Then } from 'cucumber'

import FlowieTestsWorld from './FlowieTestsWorld'

import { assert } from 'chai'

Then('the result is {string}', async function (this: FlowieTestsWorld, result: string) {
  assert.equal(this.flowieResult.result, result, 'Something went wrong and the result does not match')
})
