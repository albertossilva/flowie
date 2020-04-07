/* istanbul ignore next */
export const SyncFunctionConstructor = (() => 1).constructor as FunctionConstructor
/* istanbul ignore next */
export const AsyncFunctionConstructor = (async () => 1).constructor as FunctionConstructor

const functionConstructors = {
  Sync: SyncFunctionConstructor,
  Async: AsyncFunctionConstructor
}

export function isAsyncFunction (functionCandidate: Function) {
  return functionCandidate[Symbol.toStringTag] === 'AsyncFunction'
}

export default functionConstructors
