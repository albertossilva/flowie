import { assert } from 'chai'
import { mock, assert as sinonAssert, SinonStub } from 'sinon'

import flowie from '../flowie'

describe('flowie', function () {
  describe('@executeFlow', function () {
    const parameter = 'ARGUMENT'
    const expected = 'FINAL RESULT'

    it('executes and returns the result of synchronous function', async function () {
      const commonFunction = createSimpleFunctionMock(parameter, expected)

      const { result: actual } = await flowie(commonFunction).executeFlow(parameter)

      assert.equal(actual, expected)
      sinonAssert.calledOnce(commonFunction as SinonStub)
    })

    it('executes and returns the result of the second synchronous function, working as a chain', async function () {
      const firstFunctionReturn = 'RESULT'
      const firstFunction = createSimpleFunctionMock(parameter, firstFunctionReturn)

      const secondFunction = createSimpleFunctionMock(firstFunctionReturn, expected)

      const { result: actual } = await flowie(firstFunction)
        .pipe(secondFunction)
        .executeFlow(parameter)

      assert.equal(actual, expected)
    })

    it('pipes multiple synchronous function', async function () {
      const firstFunctionReturn = 'RESULT'
      const firstFunction = createSimpleFunctionMock(parameter, firstFunctionReturn)
      const middleWareFunction = createSimpleFunctionMock(firstFunctionReturn, firstFunctionReturn, 6)

      const lastFunction = createSimpleFunctionMock(firstFunctionReturn, expected)

      const { result: actual } = await flowie(firstFunction)
        .pipe(middleWareFunction)
        .pipe(middleWareFunction)
        .pipe(middleWareFunction)
        .pipe(middleWareFunction)
        .pipe(middleWareFunction)
        .pipe(middleWareFunction)
        .pipe(lastFunction)
        .executeFlow(parameter)

      assert.equal(actual, expected);
      (middleWareFunction as any).verify()
    })
  })
})

function createSimpleFunctionMock (parameter: string, result: string, timesToBeExecuted = 1): (argument: string) => string {
  return mock()
    .withArgs(parameter)
    .exactly(timesToBeExecuted)
    .returns(result)
}
