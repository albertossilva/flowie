import { assert } from 'chai'
import { Then } from 'cucumber'
import RuntimeFlowieWorld from './RuntimeFlowieWorld'

Then(
  'the result is {string} for flow {string}',
  function (this: RuntimeFlowieWorld, expectedResult: string, flowName: string) {
    const flowResult = this.getFlowResult(flowName)
    assert.equal(flowResult.lastResults, expectedResult, 'Result is wrong')
  }
)
