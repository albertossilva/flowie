import { assert } from 'chai'
import { mock, assert as sinonAssert, SinonStub } from 'sinon'

import flowie from '../flowie'

describe('flowie', function () {
  describe('@executeFlow', function () {
    const parameter = 'ARGUMENT'
    const finalResult = 'FINAL RESULT'

    it('executes and returns the result of synchronous function', async function () {
      const commonFunction = createSimpleFunctionMock(parameter, finalResult)

      const { result } = await flowie(commonFunction).executeFlow(parameter)

      assert.equal(result, finalResult)
      sinonAssert.calledOnce(commonFunction as SinonStub)
    })

    it('executes and returns the result of the second synchronous function, working as a chain', async function () {
      const firstFunctionReturn = 'RESULT'
      const firstFunction = createSimpleFunctionMock(parameter, firstFunctionReturn)

      const secondFunction = createSimpleFunctionMock(firstFunctionReturn, finalResult)

      const { result } = await flowie(firstFunction)
        .pipe(secondFunction)
        .executeFlow(parameter)

      assert.equal(result, finalResult)
    })

    it('pipes multiple synchronous function', async function () {
      const firstFunctionReturn = 'RESULT'
      const firstFunction = createSimpleFunctionMock(parameter, firstFunctionReturn)
      const middleWareFunction = createSimpleFunctionMock(firstFunctionReturn, firstFunctionReturn, 6)

      const lastFunction = createSimpleFunctionMock(firstFunctionReturn, finalResult)

      const bla = await flowie(firstFunction)
        .pipe(middleWareFunction)
        .pipe(middleWareFunction)
        .pipe(middleWareFunction)
        .pipe(middleWareFunction)
        .pipe(middleWareFunction)
        .pipe(middleWareFunction)
        .pipe(lastFunction)
        .executeFlow(parameter)

      assert.equal(bla.result, finalResult);
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
