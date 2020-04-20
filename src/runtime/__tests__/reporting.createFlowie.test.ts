import { assert, expect } from 'chai'
import { mock, stub, spy, assert as sinonAssert, SinonStub, SinonExpectation } from 'sinon'

import { Flowie } from '../../runtime.types'
import createFlowie from '../createFlowie'
import { FlowResult } from '../flowieResult'

describe('reporting.createFlowie (integration tests as laboratory)', function () {
  const parameter = 'ARGUMENT'
  const expected = 'FINAL RESULT'

  context('functions', function () {
    describe('pipe', function () {
      it('reports for one piped function', function () {
        const commonFunction = createSimpleFunctionMock(parameter, expected, { functionName: 'commonFunction' })

        const flow: Flowie<string, string, string> = createFlowie(commonFunction)
        const { functions } = flow(parameter) as FlowResult<string>

        expect(functions.commonFunction.calls).to.equal(1)
        expect(functions.commonFunction.slowestExecutionTime).to.greaterThan(0)
        expect(functions.commonFunction.fastestExecutionTime).to.greaterThan(0)
        expect(functions.commonFunction.averageExecutionTime).to.greaterThan(0)
        expect(functions.commonFunction.totalExecutionTime).to.greaterThan(0)
        sinonAssert.calledOnce(commonFunction as SinonStub)
      })

      it('reports for each functions being piped', function () {
        const firstReturn = 'RESULT'
        const firstFunction = createSimpleFunctionMock(parameter, firstReturn, { functionName: 'firstFunction' })
        const secondFunction = createSimpleFunctionMock(firstReturn, expected, { functionName: 'secondFunction' })

        const flow: Flowie<string, string, string> = createFlowie(firstFunction).pipe(createFlowie(secondFunction))

        const { functions } = flow(parameter) as FlowResult<string>

        expect(functions.firstFunction.calls).to.equal(1)
        expect(functions.secondFunction.calls).to.equal(1)
      })

      it('count as call if a function is used more than once', async function () {
        const firstReturn = 'RESULT'
        const firstFunction = createSimpleFunctionMock(parameter, firstReturn, { functionName: 'firstFunction' })
        const middlewareFunction = createSimpleFunctionMock(firstReturn, firstReturn, {
          functionName: 'middlewareFunction',
          timesToBeExecuted: 7
        })

        const lastFunction = createSimpleFunctionMock(firstReturn, expected, { functionName: 'lastFunction' })

        const flow = createFlowie(firstFunction)
          .pipe(middlewareFunction)
          .pipe(middlewareFunction)
          .pipe(middlewareFunction)
          .pipe(middlewareFunction)
          .pipe(createFlowie(middlewareFunction).pipe(middlewareFunction))
          .pipe(middlewareFunction)
          .pipe(lastFunction)

        const { functions } = await flow(parameter)

        expect(functions.middlewareFunction.calls).to.equal(7)
      })
    })

    describe('split', function () {
      it(
        'reports the right values for long running functions, but the longest run will drive the result',
        async function () {
          const spySooner = spy().named('sooner')
          const mockSooner = mock().named('soonerResult').returns('sooner')

          const spyLater = spy().named('later')
          const mockLater = mock().named('laterResult').returns('later')

          const spyReallyLater = spy().named('reallyLater')
          const mockReallyLater = mock().named('reallyLaterResult').returns('reallyLater')

          const shuffleSlowFlowie = [
            createFlowie(takeTimeToBeExecuted(30, 'longer')).pipe(spyReallyLater).pipe(mockReallyLater),
            createFlowie(takeTimeToBeExecuted(10, 'shorter')).pipe(spySooner).pipe(mockSooner),
            createFlowie(takeTimeToBeExecuted(20, 'average')).pipe(spyLater).pipe(mockLater)
          ]

          const flow = await createFlowie(spy().named('doesNotMatter')).split(...shuffleSlowFlowie)
          const { executionTime, functions } = await flow(null)

          expect(executionTime).to.greaterThan(29)
          expect(functions.shorter.totalExecutionTime).to.greaterThan(9)
          expect(functions.average.totalExecutionTime).to.greaterThan(19)
          expect(functions.longer.totalExecutionTime).to.greaterThan(29)
        }
      )
    })
  })

  describe('generators/iterators', function () {
    it('reports iterations for generators', function () {
      const yields = 'ABC'.split('')
      const generatorMock = createGeneratorFrom<string, string>(yields, parameter)
      const flow = createFlowie(generatorMock)

      const { functions } = flow(parameter) as FlowResult<string>

      expect(functions.traverseArray.iterations.count).to.equal(yields.length)
    })

    it('reports all iterations accordingly when a generator is below another generator', async function () {
      const byPass = createByPassFunction()

      const generatorMock = createGeneratorFrom<string, string>(['1', '2', '3'], parameter)

      function * generatorThatConcatenatesAB (previousValue: string) {
        const lettersList = ['A', 'B']
        for (const letter of lettersList) {
          yield previousValue + letter
        }
      }

      const flow = createFlowie(generatorMock)
        .pipe(generatorThatConcatenatesAB)
        .pipe(byPass)

      const { functions } = await flow(parameter)

      expect(functions.traverseArray.calls).to.equal(1)
      expect(functions.traverseArray.iterations.count).to.equal(3)
      expect(functions.generatorThatConcatenatesAB.calls).to.equal(3)
      expect(functions.generatorThatConcatenatesAB.iterations.count).to.equal(6)
      expect(functions.bypass.calls).to.equal(6)
    })
  })
})

const createByPassFunction = () => stub().named('bypass').returnsArg(0) as (x: string) => string

const takeTimeToBeExecuted = (milliseconds: number, functionName: string) => {
  const functionStub = stub().named(functionName).callsFake(async (x: any) =>
    new Promise((resolve) => setTimeout(() => resolve(x), milliseconds))
  )
  functionStub[Symbol.toStringTag] = 'AsyncFunction'
  return functionStub
}

function createSimpleFunctionMock (
  parameter: string,
  result: string,
  {
    functionName,
    timesToBeExecuted = 1
  }
): (argument: string) => string {
  return (mock(functionName) as any as SinonExpectation)
    .withArgs(parameter)
    .exactly(timesToBeExecuted)
    .returns(result)
    .named(functionName)
}

function createGeneratorFrom<A, T> (array: readonly T[], expected: A) {
  return function * traverseArray (actual: A) {
    assert.equal(expected, actual, 'Wrong parameter received')
    for (const item of array) {
      yield item
    }
  }
}
