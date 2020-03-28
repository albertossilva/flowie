import { assert } from 'chai'
import { Then } from 'cucumber'

import FlowieTestsWorld from './FlowieTestsWorld'

Then('the result is {string}', async function (this: FlowieTestsWorld, result: string) {
  assert.equal(this.flowieResult.result, result, 'Something went wrong and the result does not match')
})

Then('the final result will match', function (this: FlowieTestsWorld, resultDocString: string) {
  const expectedResult = JSON.parse(resultDocString)

  assert.deepEqual(this.flowieResult.result, expectedResult.result)
})
