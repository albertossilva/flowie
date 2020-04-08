import { assert, expect } from 'chai'
import { random, lorem } from 'faker'
import { mock, assert as sinonAssert, SinonStub, SinonExpectation, spy } from 'sinon'

import createFlowie from '../runtime/createFlowie'
import { Flowie } from '../types'
import { FlowResult } from '../runtime/flowieResult'

describe('createFlowie(integration tests as laboratory)', function () {
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
        const middleWareFunction = createSimpleFunctionMock(firstReturn, firstReturn, {
          functionName: 'middleWareFunction',
          timesToBeExecuted: 7
        })

        const lastFunction = createSimpleFunctionMock(firstReturn, expected, { functionName: 'lastFunction' })

        const flow = createFlowie(firstFunction)
          .pipe(middleWareFunction)
          .pipe(middleWareFunction)
          .pipe(middleWareFunction)
          .pipe(middleWareFunction)
          .pipe(createFlowie(middleWareFunction).pipe(middleWareFunction))
          .pipe(middleWareFunction)
          .pipe(lastFunction)

        const { lastResult: actual } = await flow(parameter)

        assert.equal(actual, expected);
        (middleWareFunction as any).verify()
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

      it('executes two functions in paralell', function () {
        const flow = createFlowie(add1).split(add1, add3)
        const flowieResult = flow(3) as FlowResult<readonly [number, number]>

        assert.deepEqual(flowieResult.lastResult, [5, 7])
      })

      it('accepts a flows on split', function () {
        const add1Flowie = createFlowie(add1)
        const flow = add1Flowie.split(createFlowie(add1).pipe(add1), add3)
        const flowieResult = flow(6) as FlowResult<readonly [number, number]>

        assert.deepEqual(flowieResult.lastResult, [9, 10])
      })

      it('executes N functions in paralell', async function () {
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

      it('executes N flowies in paralell', async function () {
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
        'executes functions in paralell, but later functions does not affect the order of the results',
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

  //     context('generators/iterators', function () {
  //       describe('pipe', function () {
  //         it('returns the last item of a generator when it is the only item', async function () {
  //           const yields = 'ABC'.split('')
  //           const generatorMock = createGeneratorFrom<string, string>(yields, parameter)
  //           const flow = flowie(generatorMock)

  //           const { lastResult } = await flow(parameter)

  //           assert.equal(lastResult, 'C')
  //         })

  //         it('calls the functions piped after a generator once per yield', async function () {
  //           const preffixWithResult = createPreffixer('result')
  //           const yields = '123'.split('')
  //           const generatorMock = createAsyncGeneratorFrom(yields, parameter)

  //           const flow = flowie(generatorMock).pipe(createByPassFunction()).pipe(preffixWithResult)

  //           const { lastResult } = await flow(parameter)
  //           sinonAssert.calledThrice(preffixWithResult as SinonStub)
  //           sinonAssert.calledWith(preffixWithResult as SinonStub, '1')
  //           sinonAssert.calledWith(preffixWithResult as SinonStub, '2')
  //           sinonAssert.calledWith(preffixWithResult as SinonStub, '3')
  //           assert.equal(lastResult, 'result 3')
  //         })

  //         it('returns the last item of generator when it is the last item', async function () {
  //           const generatorMock = createGeneratorFrom<string, string>('XYZ'.split(''), parameter)

  //           const flow = flowie(createByPassFunction())
  //             .pipe(createByPassFunction())
  //             .pipe(generatorMock)

  //           const { lastResult } = await flow(parameter)

  //           assert.equal(lastResult, 'Z')
  //         })

  //         // it('accepts generators piped in the middle of flow, and all piped function are called', async function () {
  //         //   const preffixWithHome = createPreffixer('home,')
  //         //   const preffixWithSweetHome = createPreffixer('sweet home')
  //         //   const preffixWithOwMy = createPreffixer('ow my!')

  //         //   const yields = '#@?!'
  //         //   const generatorMock = createAsyncGeneratorFrom(yields.split(''), parameter)

  //         //   const flow = flowie(createByPassFunction())
  //         //     .pipe(flowie(generatorMock))
  //         //     .pipe(preffixWithSweetHome)
  //         //     .pipe(flowie(preffixWithHome).pipe(preffixWithOwMy))

  //         //   const { lastResult } = await flow(parameter)

  //         //   assert.equal(lastResult, 'ow my! home, sweet home !')
  //         //   assert.equal((preffixWithSweetHome as SinonStub).callCount, yields.length)
  //         //   assert.equal((preffixWithHome as SinonStub).callCount, yields.length)
  //         //   assert.equal((preffixWithOwMy as SinonStub).callCount, yields.length)
  //         // })

  //         // it('accepts generators piping to generators', async function () {
  //         //   const byPass = spy().named('byPass')

  //         //   const generatorMock = createGeneratorFrom<string, string>(['1', '2', '3'], parameter)

  //         //   function * generatorThatConcatenatesAB (previousValue: string) {
  //         //     const lettersList = ['A', 'B']
  //         //     for (const letter of lettersList) {
  //         //       yield previousValue + letter
  //         //     }
  //         //   }

  //         //   const flow = flowie(generatorMock)
  //         //     .pipe(generatorThatConcatenatesAB)
  //         //     .pipe(byPass as (x: string) => string)

  //         //   await flow(parameter)

//       //   // assert.equal((commonFunction as SinonStub).callCount, 4)
//       // })
//       })
//     })
})

// const createByPassFunction = () => stub().returnsArg(0) as (x: string) => string
// const createPreffixer = (preffix: string) => stub().named(`preffixer-${preffix}`)
//   .callsFake((x: string): string => `${preffix} ${x}`) as (x: string) => string
const add = (shouldBeAdded: number) => (numberToAdd: number) => numberToAdd + shouldBeAdded
const add1 = add(1)
const add2 = add(2)
const add3 = add(3)

const takeTimeToBeExecuted = (miliseconds: number) => async (x: any) => {
  await new Promise((resolve) => setTimeout(() => resolve(), miliseconds))
  return x
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

// function createGeneratorFrom<A, T> (array: readonly T[], expected: A) {
//   return function * traverseArray (actual: A) {
//     assert.equal(expected, actual, 'Wrong parameter received')
//     for (const item of array) {
//       yield item
//     }
//   }
// }

// function createAsyncGeneratorFrom<A, T> (array: readonly T[], expected: A) {
//   return async function * traverseArray (actual: A) {
//     assert.equal(expected, actual, 'Wrong parameter received')
//     for (const item of array) {
//       yield item
//     }
//   }
// }
