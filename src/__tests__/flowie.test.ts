import { assert, expect } from 'chai'
import { random } from 'faker'
import { mock, stub, assert as sinonAssert, SinonStub, spy } from 'sinon'

import flowie from '../flowie'
import { Flowie } from '../flowie.type'

describe('flowie', function () {
  describe('@executeFlowieContainer', function () {
    const parameter = 'ARGUMENT'
    const expected = 'FINAL RESULT'

    describe('pipe', function () {
      context('functions', function () {
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

      context('generators', function () {
        it('calls the functions piped after a generator once per yield', async function () {
          const commonFunction = stub().named('commonFunction').callsFake((x: string): string => 'result '.concat(x))
          const yields = ['1', '2', '3']
          const generatorStub = stub().named('generator').returns(yields[Symbol.iterator]())
          // eslint-disable-next-line functional/immutable-data
          ;(generatorStub as any)[Symbol.toStringTag] = 'GeneratorFunction'

          const { result } = await flowie(generatorStub).pipe(commonFunction).executeFlow(parameter)
          sinonAssert.calledThrice(commonFunction as SinonStub)
          sinonAssert.calledWith(commonFunction as SinonStub, '1')
          sinonAssert.calledWith(commonFunction as SinonStub, '2')
          sinonAssert.calledWith(commonFunction as SinonStub, '3')
          expect(result).to.equal('result 3')
        })

        it('accepts generators functions in the middle of flow', async function () {
          const commonFunction = stub().named('commonFunction').callsFake((x: string): string => 'result '.concat(x))
          const yields = ['1', '2', '3']
          const generatorStub = mock().named('generator').withArgs('result ARGUMENT').returns(yields[Symbol.iterator]())
            // eslint-disable-next-line functional/immutable-data
            ; (generatorStub as any)[Symbol.toStringTag] = 'GeneratorFunction'

          const { result } = await flowie(commonFunction).pipe(generatorStub).pipe(commonFunction).executeFlow(parameter)

          assert.equal((commonFunction as SinonStub).callCount, 4)
          expect(result).to.equal('result 3')
        })

        it('accepts generators piping to generators')
      })
    })

    describe('split', function () {
      it('executes two functions in paralell', async function () {
        const add1Flowie = flowie(add1)
        const flowieResult = await add1Flowie.split(add1Flowie, add1Flowie.pipe(add2)).executeFlow(3)

        assert.deepEqual(flowieResult.result, [5, 7])
      })

      it('executes N functions in paralell', async function () {
        const numberOfFlowsThatReturnsFive = random.number({ min: 10, max: 20 })
        const add1Flowie = flowie(add1)
        const nineAddFlowieThatAdd1AndOneAddThreeFlowie = [
          ...new Array(numberOfFlowsThatReturnsFive).fill(add1Flowie) as readonly Flowie<number, number, number>[],
          add1Flowie.pipe(add2)]
        const flowieResult = await add1Flowie.split(...nineAddFlowieThatAdd1AndOneAddThreeFlowie).executeFlow(3)

        assert.deepEqual(flowieResult.result, [...new Array(numberOfFlowsThatReturnsFive).fill(5), 7])
      })

      it('executes functions in paralell, but later functions does not affect the order of the results', async function () {
        const spySooner = spy().named('sooner')
        const mockSooner = mock().named('soonerResult').returns('sooner')

        const spyLater = spy().named('later')
        const mockLater = mock().named('laterResult').returns('later')

        const spyReallyLater = spy().named('reallyLater')
        const mockReallyLater = mock().named('reallyLaterResult').returns('reallyLater')

        const shuffleSlowFlowie = [
          flowie(takeTimeToBeExecuted(30)).pipe(spyReallyLater).pipe(mockReallyLater),
          flowie(takeTimeToBeExecuted(10)).pipe(spySooner).pipe(mockSooner),
          flowie(takeTimeToBeExecuted(20)).pipe(spyLater).pipe(mockLater)
        ]

        const { result } = await flowie(spy().named('doesNotMatter')).split(...shuffleSlowFlowie).executeFlow(null)

        sinonAssert.callOrder(spySooner, spyLater, spyReallyLater)
        assert.deepEqual(result, ['reallyLater', 'sooner', 'later'])
      })

      it('accepts split as the first flowie step', async function () {
        const flowieResult = await flowie(add1, add2).executeFlow(4)

        assert.deepEqual(flowieResult.result, [5, 6])
      })
    })
  })
})

const takeTimeToBeExecuted = (miliseconds: number) => (x: any) => new Promise((resolve) => setTimeout(() => resolve(x), miliseconds))

const add = (shouldBeAdded: number) => (numberToAdd: number) => numberToAdd + shouldBeAdded
const add1 = add(1)
const add2 = add(2)

function createSimpleFunctionMock (parameter: string, result: string, timesToBeExecuted = 1): (argument: string) => string {
  return mock()
    .withArgs(parameter)
    .exactly(timesToBeExecuted)
    .returns(result)
}
