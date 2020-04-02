import { FlowFunction } from './flowie.type'

const flowieFunction = Symbol('flowieFunction')

export function markAsFlowieFunction<T, Argument, Result> (
  executeFlowFunction: T,
  flowFunction: FlowFunction<Argument, Result>
): T {
  // eslint-disable-next-line functional/immutable-data
  return Object.assign(executeFlowFunction, { [flowieFunction]: flowFunction })
}

export function isFlowieFunction (flowFunction: Function): boolean {
  return flowieFunction in flowFunction
}

export function getFlowieFunction (flowFunction: Function): Function {
  return flowFunction[flowieFunction]
}
