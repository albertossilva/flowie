function PromiseQueue<Argument, Result>(
  callback: (argument: Argument) => Promise<Result>,
  { parallelPromises }: { readonly parallelPromises: number }
): QueueWithoutContext<Argument, Result>
// eslint-disable-next-line no-redeclare
function PromiseQueue <Argument, Result, Context>(
  callback: (argument: Argument, context: Context) => Promise <Result>,
  { parallelPromises }: { readonly parallelPromises: number }
): Queue<Argument, Result, Context>
// eslint-disable-next-line no-redeclare
function PromiseQueue<Argument, Context, Result> (
  callback: (argument: Argument, context: Context) => Promise<Result>,
  { parallelPromises }: { readonly parallelPromises: number }
): Queue<Argument, Result, Context> {
  return {
    async enqueue (...argumentsList: ReadonlyArray<any>) {
      return new EnqueuedPromises<Argument, Result, Context>(callback, parallelPromises, [], 0)
        .enqueue(...argumentsList)
    },
    async lastItemToBeProcessed () {
      return undefined as any
    }
  }
}

export default PromiseQueue

export interface Queue<Argument, Result, Context> {
  readonly enqueue: (argument: Argument, context: Context) => Promise<Queue<Argument, Result, Context>>
  readonly lastItemToBeProcessed: () => Promise<Result>
}

export interface QueueWithoutContext<Argument, Result> {
  readonly enqueue: (argument: Argument) => Promise<QueueWithoutContext<Argument, Result>>
  readonly lastItemToBeProcessed: () => Promise<Result>
}

class EnqueuedPromises<Argument, Result, Context> implements Queue<Argument, Result, Context> {
  private readonly promisesList: ReadonlyArray<Promise<Result>>

  constructor (
    private readonly callback: (argument: Argument, context: Context) => Promise<Result>,
    private readonly parallelPromises: number,
    private readonly promiseEnqueuedList: ReadonlyArray<PromiseOnQueue<Result>>,
    private readonly enqueuedPromises: number
  ) {
    this.promisesList = promiseEnqueuedList.map(getPromise)
  }

  async enqueue (...argumentsList: ReadonlyArray<any>) {
    return new EnqueuedPromises<Argument, Result, Context>(
      this.callback,
      this.parallelPromises,
      await this.enqueueOrAwaitPromisesToBeResolved(argumentsList),
      this.enqueuedPromises + 1
    ) as Queue<Argument, Result, Context>
  }

  private async enqueueOrAwaitPromisesToBeResolved (
    argumentsList: ReadonlyArray<any>
  ): Promise<ReadonlyArray<PromiseOnQueue<Result>>> {
    const { promiseEnqueuedList } = this
    if (promiseEnqueuedList.length < this.parallelPromises) {
      return promiseEnqueuedList.concat(this.createPromiseOnQueue(argumentsList))
    }

    const resolvedIndex = await Promise.race(promiseEnqueuedList.map(getRacingPromises))
    const indexOnList = this.promiseEnqueuedList.findIndex(matchIndex, { resolvedIndex })
    return promiseEnqueuedList.slice(0, indexOnList).concat(
      promiseEnqueuedList.slice(indexOnList + 1),
      this.createPromiseOnQueue(argumentsList)
    )
  }

  private createPromiseOnQueue (argumentsList: ReadonlyArray<any>): PromiseOnQueue<Result> {
    return { promise: this.callback.apply(null, argumentsList), index: this.enqueuedPromises + 1 }
  }

  async lastItemToBeProcessed (): Promise<Result> {
    const [lastPromise] = this.promiseEnqueuedList.slice(-1)
    await Promise.all(this.promisesList)

    return lastPromise.promise
  }
}

function getPromise<Result> ({ promise }: PromiseOnQueue<Result>) {
  return promise
}

function matchIndex<Result> (this: { readonly resolvedIndex: number }, { index }: PromiseOnQueue<Result>) {
  return index === this.resolvedIndex
}

async function getRacingPromises<Result> (
  { promise, index }: PromiseOnQueue<Result>
): Promise<number> {
  await promise
  return index
}

interface PromiseOnQueue<Result> {
  readonly promise: Promise<Result>
  readonly index: number
}
