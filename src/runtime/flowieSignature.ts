const flowieSignature = Symbol('flowieSignature')

export function signAsFlowieFunction<T> (executeFlowFunction: T): T {
  // eslint-disable-next-line functional/immutable-data
  return Object.assign(executeFlowFunction, { [flowieSignature]: true })
}

export function isSignedAsFlowieFunction (flowFunction: Function): boolean {
  return Boolean(flowFunction) && flowieSignature in flowFunction
}
