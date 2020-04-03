import { assert } from 'chai'
import { Then } from 'cucumber'
import ConfigurationFlowieWorld from './ConfigurationFlowieWorld'

Then(
  'the result is {string} for flow from configuration: {string}',
  function (this: ConfigurationFlowieWorld, expectedResult: string, flowName: string) {
    const flowResult = this.getFlowResult(flowName)
    assert.equal(flowResult.lastResults, expectedResult, 'Result is wrong')
  }
)

Then(
  'the result of flow from configuration: {string} is',
  function (this: ConfigurationFlowieWorld, flowName: string, expectedResultJSON: string) {
    const expectedResult = JSON.parse(expectedResultJSON)
    const flowResult = this.getFlowResult(flowName)
    assert.deepEqual(flowResult.lastResults, expectedResult, 'Result is wrong')
  }
)
