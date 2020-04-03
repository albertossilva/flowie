/* istanbul ignore next */
export const syncConstructor = (() => 1).constructor as FunctionConstructor
/* istanbul ignore next */
export const asyncConstructor = (async () => 1).constructor as FunctionConstructor

const functionConstructors = {
  sync: syncConstructor,
  async: asyncConstructor
}

export function isAsyncFunction (functionCandidate: Function) {
  return functionCandidate[Symbol.toStringTag] === 'AsyncFunction'
}

export default functionConstructors
