import { assert } from 'chai'
import { Then } from 'cucumber'
import ConfigurationFlowieWorld from './ConfigurationFlowieWorld'

Then(
  'the result is {string} for flow from configuration: {string}',
  function (this: ConfigurationFlowieWorld, expectedResult: string, flowName: string) {
    const flowResult = this.getFlowResult(flowName)
    assert.equal(flowResult.lastResult, expectedResult, 'Result is wrong')
  }
)

Then(
  'the result of flow from configuration: {string} is',
  function (this: ConfigurationFlowieWorld, flowName: string, expectedResultJSON: string) {
    const expectedResult = JSON.parse(expectedResultJSON)
    const flowResult = this.getFlowResult(flowName)
    assert.deepEqual(flowResult.lastResult, expectedResult, 'Result is wrong')
  }
)

Then(
  'the promise result is {string} for flow from configuration: {string}',
  async function (this: ConfigurationFlowieWorld, expectedResult: string, flowName: string) {
    const promiseCandidate = this.getAsyncFlowResult(flowName)
    assert.instanceOf(promiseCandidate, Promise, 'The result was not a promise')
    const flowResult = await promiseCandidate
    assert.equal(flowResult.lastResult, expectedResult, 'Result is wrong')
  }
)
