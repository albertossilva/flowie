import { assert, expect } from 'chai'
import { random, lorem } from 'faker'
import { mock, stub, spy, assert as sinonAssert, SinonStub, SinonExpectation } from 'sinon'

import { Flowie } from '../../runtime.types'
import createFlowie from '../createFlowie'
import { FlowResult } from '../flowieResult'

describe('runtime.createFlowie (integration tests as laboratory)', function () {
  const parameter = 'ARGUMENT'
  const expected = 'FINAL RESULT'

  context('functions', function () {
    describe('pipe', function () {
      it('executes and returns the result of synchronous function', function () {
        const commonFunction = createSimpleFunctionMock(parameter, expected)

        const flow: Flowie<string, string, string> = createFlowie(commonFunction)
        const { lastResult: actual } = flow(parameter) as FlowResult<string>

        assert.equal(actual, expected)
        sinonAssert.calledOnce(commonFunction as SinonStub)
      })

      it('accepts flowie objects as functions', async function () {
        const commonFunction = createSimpleFunctionMock(parameter, expected)

        const { lastResult: actual } = await createFlowie(createFlowie(createFlowie(commonFunction)))(parameter)

        assert.equal(actual, expected)
        sinonAssert.calledOnce(commonFunction as SinonStub)
      })

      it('accepts async functions', async function () {
        const commonFunction = createAsyncFunctionMock(parameter, expected)

        const promise = createFlowie(commonFunction)(parameter)
        expect(promise).to.instanceOf(Promise)
        const { lastResult: actual } = await promise

        assert.equal(actual, expected)
        sinonAssert.calledOnce(commonFunction as SinonStub)
      })

      it('executes and returns the result of the second synchronous flow, working as a chain', function () {
        const firstReturn = 'RESULT'
        const firstFunction = createSimpleFunctionMock(parameter, firstReturn, { functionName: 'firstFunction' })
        const secondFunction = createSimpleFunctionMock(firstReturn, expected, { functionName: 'secondFunction' })

        const flow: Flowie<string, string, string> = createFlowie(firstFunction).pipe(createFlowie(secondFunction))

        const { lastResult: actual } = flow(parameter) as FlowResult<string>

        assert.equal(actual, expected)
      })

      it('pipes multiple synchronous function', async function () {
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

        const { lastResult: actual } = await flow(parameter)

        assert.equal(actual, expected);
        (middlewareFunction as SinonExpectation).verify()
      })
    })

    describe('split', function () {
      it('starting with split', function () {
        const flow = createFlowie(add1, add2, add1, add2)
        const flowieResult = flow(3) as FlowResult<readonly [number, number, number, number]>

        assert.deepEqual(flowieResult.lastResult, [4, 5, 4, 5])
      })

      it('accepts other flowie when start splitting', async function () {
        const add1Flow = createFlowie(add1)
        const add3Flow = createFlowie(add1).pipe(add2)
        const flow = createFlowie(add1, add2, add1Flow, add3Flow)
        const flowieResult = await flow(5)

        assert.deepEqual(flowieResult.lastResult, [6, 7, 6, 8])
      })

      it('accepts other flowie as first item when start splitting', async function () {
        const flow = createFlowie(createFlowie(add1), add2)
        const flowieResult = await flow(10)

        assert.deepEqual(flowieResult.lastResult, [11, 12])
      })

      it('executes two functions in parallel', function () {
        const flow = createFlowie(add1).split(add1, add3)
        const flowieResult = flow(3) as FlowResult<readonly [number, number]>

        assert.deepEqual(flowieResult.lastResult, [5, 7])
      })

      it('accepts flowie on split', function () {
        const add1Flowie = createFlowie(add1)
        const flow = add1Flowie.split(createFlowie(add1).pipe(add1), add3)
        const flowieResult = flow(6) as FlowResult<readonly [number, number]>

        assert.deepEqual(flowieResult.lastResult, [9, 10])
      })

      it('executes N functions in parallel', async function () {
        const numberOfFlowsThatReturnsFive = random.number({ min: 10, max: 20 })
        const add1Flowie = createFlowie(add1)
        const nineAddFlowieThatAdd1AndOneAddThreeFlowie = [
          ...new Array<any>(numberOfFlowsThatReturnsFive).fill(add1),
          add2
        ]
        const flow = add1Flowie.split(...nineAddFlowieThatAdd1AndOneAddThreeFlowie)
        const flowieResult = await flow(4)

        assert.deepEqual(flowieResult.lastResult, [...new Array(numberOfFlowsThatReturnsFive).fill(6), 7])
      })

      it('executes N flowie in parallel', async function () {
        const numberOfFlowsThatReturnsFive = random.number({ min: 10, max: 20 })
        const add1Flowie = createFlowie(add1)
        const nineAddFlowieThatAdd1AndOneAddThreeFlowie = [
          ...new Array<Flowie<number, number, number>>(numberOfFlowsThatReturnsFive).fill(add1Flowie),
          add2
        ]
        const flow = add1Flowie.split(...nineAddFlowieThatAdd1AndOneAddThreeFlowie)
        const flowieResult = await flow(4)

        assert.deepEqual(flowieResult.lastResult, [...new Array(numberOfFlowsThatReturnsFive).fill(6), 7])
      })

      it(
        'executes functions in parallel, but later functions does not affect the order of the results',
        async function () {
          const spySooner = spy().named('sooner')
          const mockSooner = mock().named('soonerResult').returns('sooner')

          const spyLater = spy().named('later')
          const mockLater = mock().named('laterResult').returns('later')

          const spyReallyLater = spy().named('reallyLater')
          const mockReallyLater = mock().named('reallyLaterResult').returns('reallyLater')

          const shuffleSlowFlowie = [
            createFlowie(takeTimeToBeExecuted(30)).pipe(spyReallyLater).pipe(mockReallyLater),
            createFlowie(takeTimeToBeExecuted(10)).pipe(spySooner).pipe(mockSooner),
            createFlowie(takeTimeToBeExecuted(20)).pipe(spyLater).pipe(mockLater)
          ]

          const flow = await createFlowie(spy().named('doesNotMatter')).split(...shuffleSlowFlowie)
          const { lastResult } = await flow(null)

          sinonAssert.callOrder(spySooner, spyLater, spyReallyLater)
          assert.deepEqual(lastResult, ['reallyLater', 'sooner', 'later'])
        }
      )
    })
  })

  describe('generators/iterators', function () {
    it('returns the last item of a generator when it is the only item', function () {
      const yields = 'ABC'.split('')
      const generatorMock = createTraverseArrayGenerator<string, string>(yields, parameter)
      const flow = createFlowie(generatorMock)

      const { lastResult } = flow(parameter) as FlowResult<string>

      assert.equal(lastResult, 'C')
    })

    it('calls the functions piped after a generator once per yield', async function () {
      const prefixWithResult = createPrefixed('result')
      const yields = '123'.split('')
      const generatorMock = createAsyncTraverseArrayGenerator(yields, parameter)

      const flow = createFlowie(generatorMock).pipe(createByPassFunction()).pipe(prefixWithResult)

      const promise = flow(parameter)
      expect(promise).to.instanceOf(Promise)
      const { lastResult } = await promise
      sinonAssert.calledThrice(prefixWithResult as SinonStub)
      sinonAssert.calledWith(prefixWithResult as SinonStub, '1')
      sinonAssert.calledWith(prefixWithResult as SinonStub, '2')
      sinonAssert.calledWith(prefixWithResult as SinonStub, '3')
      assert.equal(lastResult, 'result 3')
    })

    it('returns the last item of generator when it is the last item', function () {
      const generatorMock = createTraverseArrayGenerator<string, string>('XYZ'.split(''), parameter)

      const flow = createFlowie(createByPassFunction())
        .pipe(createByPassFunction())
        .pipe(generatorMock)

      const { lastResult } = flow(parameter) as FlowResult<string>

      assert.equal(lastResult, 'Z')
    })

    it('accepts generators piped in the middle of flow, and all piped function are called', function () {
      const prefixWithHome = createPrefixed('home,')
      const prefixWithSweetHome = createPrefixed('sweet home')
      const prefixWithOwMy = createPrefixed('ow my!')

      const yields = '#@?!'
      const generatorMock = createTraverseArrayGenerator(yields.split(''), parameter)

      const flow = createFlowie(createByPassFunction())
        .pipe(generatorMock)
        .pipe(prefixWithSweetHome)
        .pipe(createFlowie(prefixWithHome).pipe(prefixWithOwMy))

      const { lastResult } = flow(parameter) as FlowResult<string>

      assert.equal(lastResult, 'ow my! home, sweet home !')
      assert.equal((prefixWithSweetHome as SinonStub).callCount, yields.length)
      assert.equal((prefixWithHome as SinonStub).callCount, yields.length)
      assert.equal((prefixWithOwMy as SinonStub).callCount, yields.length)
    })

    it('calls 6 times piped function after generators with 3 and 2 yields', function () {
      const byPass = createByPassFunction()

      const generatorMock = createTraverseArrayGenerator<string, string>(['1', '2', '3'], parameter)

      function * generatorThatConcatenatesAB (previousValue: string) {
        const lettersList = ['A', 'B']
        for (const letter of lettersList) {
          yield previousValue + letter
        }
      }

      const flow = createFlowie(generatorMock)
        .pipe(generatorThatConcatenatesAB)
        .pipe(byPass)

      flow(parameter)

      assert.equal((byPass as SinonStub).callCount, 6)
    })

    it('consumes all yields from a generator in split, but do not yields on flow items after', function () {
      const yields = 'ABC'.split('')
      const generatorMock = createTraverseArrayGenerator(yields, parameter)
      const countingCallsAfterSplitGenerator = stub().named('countingCallsAfterSplitGenerator').returnsArg(0)
      const flow = createFlowie(generatorMock, createByPassFunction()).pipe(countingCallsAfterSplitGenerator)

      const { lastResult } = flow(parameter) as FlowResult<readonly [string, string]>

      assert.deepEqual(lastResult, ['C', parameter])
      sinonAssert.calledOnce(countingCallsAfterSplitGenerator)
    })

    it('process iteration in parallel', async function () {
      // const yields = '1_2_3_4_5_6_7_8_9_10_11'.split('_')
      // const generatorMock = createTraverseArrayGenerator(yields, parameter)

      // const executeIn50 = takeTimeToBeExecuted(50)
      // const executeIn5 = takeTimeToBeExecuted(5)

      // const stubThatTakesLongerOnFirstCall = stub()
      //   .named('stubThatTakesLongerOnFirstCall')
      //   .onFirstCall().callsFake(executeIn50)
      //   .callsFake(executeIn5)

      // stubThatTakesLongerOnFirstCall[Symbol.toStringTag] = 'AsyncFunction'

      // const flow = createFlowie(generatorMock, { parallelExecutions: 10 }).pipe(stubThatTakesLongerOnFirstCall)

      // const { lastResult, executionTime } = await flow(parameter)

      // assert.deepEqual(lastResult, '11')
      // assert.isAtMost(executionTime, 70)
    })

    // it('process iteration in parallel in generators in the middle', async function () {
    //   const yields = '11_12_13_14_15_16_17_18_19_20_21'.split('_')
    //   const generatorMock = createTraverseArrayGenerator(yields, parameter, undefined)

    //   const executeIn50 = takeTimeToBeExecuted(50)
    //   const executeIn5 = takeTimeToBeExecuted(5)

    //   const stubThatTakesLongerOnFirstCall = stub()
    //     .named('stubThatTakesLongerOnFirstCall')
    //     .onFirstCall().callsFake(executeIn50)
    //     .callsFake(executeIn5)

    //   stubThatTakesLongerOnFirstCall[Symbol.toStringTag] = 'AsyncFunction'

    //   const flow = createFlowie(createByPassFunction())
    //     .pipe([generatorMock, { parallelExecutions: 2 }])
    //     .pipe(stubThatTakesLongerOnFirstCall)

    //   const { lastResult, executionTime } = await flow(parameter)

    //   assert.deepEqual(lastResult, '21')
    //   assert.isAtMost(executionTime, 100)
    // })
  })

  describe('context', function () {
    it('sends the context of same type on every flowItem', async function () {
      const contextValue = lorem.word()

      const commonFunction =
        createSimpleFunctionMock(parameter, expected) as (argument: string, context: string) => string

      const asyncFunction =
        createAsyncFunctionMock(expected, 'Split') as (argument: string, context: string) => Promise<string>
      const generatorFunction = spy(createTraverseArrayGenerator([1, 2, 3], expected, contextValue))
      generatorFunction[Symbol.toStringTag] = 'GeneratorFunction'
      const commonFunctionWithoutContext = createSimpleFunctionMock(expected, 'no context')
      const subFlowFunction =
        createSimpleFunctionMock(expected, 'subFlow') as (argument: string, context: string) => string

      const subFlow = createFlowie(subFlowFunction)

      const flow = createFlowie(commonFunction)
        .split(asyncFunction, generatorFunction, commonFunctionWithoutContext, subFlow)
      const { lastResult: actual } = await flow(parameter, contextValue)

      assert.deepEqual(actual, ['Split', 3, 'no context', 'subFlow'])
      sinonAssert.calledWithExactly(commonFunction as SinonStub, parameter, contextValue)
      sinonAssert.calledWithExactly(asyncFunction as SinonStub, expected, contextValue)
      sinonAssert.calledWithExactly(generatorFunction, expected, contextValue)
      sinonAssert.calledWithExactly(commonFunctionWithoutContext as SinonStub, expected, contextValue)
      sinonAssert.calledWithExactly(subFlowFunction as SinonStub, expected, contextValue)
    })
  })
})

const createByPassFunction = () => stub().returnsArg(0) as (x: string) => string
const createPrefixed = (prefix: string) => {
  const prefixForFunctionName = prefix.replace(/\s+/g, '_').replace(/[^0-9a-z_]/gi, '')
  return stub().named(`prefixed_${prefixForFunctionName}`)
    .callsFake((x: string): string => `${prefix} ${x}`) as (x: string) => string
}
const add = (shouldBeAdded: number) => (numberToAdd: number) => numberToAdd + shouldBeAdded
const add1 = add(1)
const add2 = add(2)
const add3 = add(3)

const takeTimeToBeExecuted = (milliseconds: number) => async (x: any) => {
  return new Promise((resolve) => setTimeout(() => resolve(x), milliseconds))
}

function createSimpleFunctionMock (
  parameter: string,
  result: string,
  {
    functionName = lorem.word(),
    timesToBeExecuted = 1
  } = {}
): (argument: string) => string {
  return (mock(functionName) as any as SinonExpectation)
    .withArgs(parameter)
    .exactly(timesToBeExecuted)
    .returns(result)
    .named(functionName)
}

function createAsyncFunctionMock (
  parameter: string,
  result: string,
  timesToBeExecuted = 1
): (argument: string) => Promise<string> {
  const asyncMock = mock()
    .withArgs(parameter)
    .exactly(timesToBeExecuted)
    .resolves(result)

  asyncMock[Symbol.toStringTag] = 'AsyncFunction'
  return asyncMock
}

function createTraverseArrayGenerator<A, T, C = never> (
  yields: ReadonlyArray<T>,
  expectedArgument: A,
  expectedContext: C = undefined
) {
  return function * traverseArray (actual: A, actualContext: C) {
    assert.equal(expectedArgument, actual, 'Wrong parameter received')
    assert.equal(expectedContext, actualContext, 'Wrong context received')
    for (const item of yields) {
      yield item
    }
  }
}

function createAsyncTraverseArrayGenerator<A, T> (array: ReadonlyArray<T>, expected: A) {
  return async function * traverseArray (actual: A) {
    assert.equal(expected, actual, 'Wrong parameter received')
    for (const item of array) {
      yield item
    }
  }
}
