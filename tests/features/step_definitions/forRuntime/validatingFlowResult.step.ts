import { assert } from 'chai'
import { Then } from 'cucumber'
import RuntimeFlowieWorld from './RuntimeFlowieWorld'

Then(
  'the result should be {string} for flow {string}',
  function (this: RuntimeFlowieWorld, expectedResult: string, flowName: string) {
    const flowResult = this.getFlowResult(flowName)
    assert.equal(flowResult.lastResult, expectedResult, 'Result is wrong')
  }
)

Then('the result of flow {string} is', function (this: RuntimeFlowieWorld, flowName: string, resultMatch: string) {
  const expectedResult = JSON.parse(resultMatch)
  const flowResult = this.getFlowResult(flowName)
  assert.deepEqual(flowResult.lastResult, expectedResult, 'Result is wrong')
})

Then(
  'the promise result is {string} for flow {string}',
  async function (this: RuntimeFlowieWorld, expectedResult: string, flowName: string) {
    const promiseCandidate = this.getAsyncFlowResult(flowName)
    assert.instanceOf(promiseCandidate, Promise, 'The result was not a promise')
    const flowResult = await promiseCandidate
    assert.deepEqual(flowResult.lastResult, expectedResult, 'Result is wrong')
  }
)

Then(
  'the promise result of flow {string} is',
  async function (this: RuntimeFlowieWorld, flowName: string, resultMatch: string) {
    const promiseCandidate = this.getAsyncFlowResult(flowName)
    assert.instanceOf(promiseCandidate, Promise, 'The result was not a promise')
    const flowResult = await promiseCandidate

    const expectedResult = JSON.parse(resultMatch)
    assert.deepEqual(flowResult.lastResult, expectedResult, 'Result is wrong')
  }
)
