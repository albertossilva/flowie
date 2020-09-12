import { expect } from 'chai'
import { stub, mock, assert, SinonExpectation } from 'sinon'
import { lorem } from 'faker'

import PromiseQueue from '../PromiseQueue'

const actualFirstArgument = lorem.word()
const actualSecondArgument = lorem.word()
const contextArgument = lorem.word()
const expected = lorem.word()

describe('runtime/PromiseQueue', function () {
  it('returns the last promise, and process them in parallel', async function () {
    const stubFunction = stub().named('stubbed')
      .onFirstCall().callsFake(returnAfter({ time: 7, value: 'not-the-last' }))
      .onSecondCall().callsFake(returnAfter({ time: 5, value: expected }))

    const promiseQueue = PromiseQueue(stubFunction, { parallelPromises: 2 })
    const promiseQueueWithOnePromise = await promiseQueue.enqueue(actualFirstArgument)
    const promiseQueueWithTwoPromises = await promiseQueueWithOnePromise.enqueue(actualSecondArgument)

    const actual = await promiseQueueWithTwoPromises.lastItemToBeProcessed()

    expect(actual).to.equal(expected)
  })

  it('returns the undefined if no calls is enqueue', async function () {
    const neverCalledMock = (mock('mocked') as unknown as SinonExpectation).never()
    const promiseQueue = PromiseQueue(neverCalledMock, { parallelPromises: 2 })

    const actual = await promiseQueue.lastItemToBeProcessed()

    expect(actual).to.undefined
  })

  it('does not add on the promise the last promise, and process them in parallel', async function () {
    const stubFunction = stub().named('stubbed')
      .onFirstCall().callsFake(returnAfter({ time: 30, value: 'not-the-last' }))
      .onSecondCall().callsFake(returnAfter({ time: 5, value: 'not-the-last' }))
      .onThirdCall().callsFake(returnAfter({ time: 1, value: expected }))

    const promiseQueue = PromiseQueue(stubFunction, { parallelPromises: 2 })
    const promiseQueueWithOnePromise = await promiseQueue.enqueue(actualFirstArgument)
    const promiseQueueWithTwoPromises = await promiseQueueWithOnePromise.enqueue(actualSecondArgument)

    const promiseQueueWithThreePromises = promiseQueueWithTwoPromises.enqueue(actualSecondArgument)
    assert.callCount(stubFunction, 2)

    const actual = await (await promiseQueueWithThreePromises).lastItemToBeProcessed()

    expect(actual).to.equal(expected)
  })

  it('sends just argument for function without context argument', async function () {
    const stubFunction = stub().named('justArgs').resolvesArg(0)

    const promiseQueue = PromiseQueue(stubFunction, { parallelPromises: 2 })
    const promiseQueueWithOnePromise = await promiseQueue.enqueue(actualFirstArgument)

    const actual = await promiseQueueWithOnePromise.lastItemToBeProcessed()

    assert.calledOnceWithExactly(stubFunction, actualFirstArgument)

    expect(actual).to.equal(actualFirstArgument)
  })

  it('accepts context and argument', async function () {
    const stubFunction = stub().named('withContext').resolvesArg(0)

    const promiseQueue = PromiseQueue(stubFunction as CallbackWithContext, { parallelPromises: 2 })
    const promiseQueueWithOnePromise = await promiseQueue.enqueue(actualFirstArgument, contextArgument)
    const promiseQueueWithTwoPromises = await promiseQueueWithOnePromise.enqueue(actualSecondArgument, contextArgument)

    const actual = await promiseQueueWithTwoPromises.lastItemToBeProcessed()

    assert.calledTwice(stubFunction)
    assert.calledWithExactly(stubFunction.firstCall, actualFirstArgument, contextArgument)
    assert.calledWithExactly(stubFunction.secondCall, actualSecondArgument, contextArgument)

    expect(actual).to.equal(actualSecondArgument)
  })
})

interface CallbackWithContext {
  (argument: string, context: string): Promise<string>
}

function returnAfter<Result> ({ time, value }: { readonly time: number, readonly value: Result }) {
  return function waitAndReturn () {
    return new Promise((resolve: (value?: unknown) => void) => {
      setTimeout(() => resolve(value), time)
    })
  }
}
