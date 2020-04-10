import { FlowieContainer } from '../container/createFlowieContainer'
import { PreparedFlowieManager } from '../declaration/createFlowDeclarationManager'
import { Flowie } from '../runtime.types'

const flowieSignature = Symbol('flowieSignature')

export function signAsFlowieFunction<T> (
  executeFlowFunction: T,
  flowieContainer: FlowieContainer,
  preparedFlowieManager: PreparedFlowieManager
): T {
  return Object.freeze(
    // eslint-disable-next-line functional/immutable-data
    Object.assign(executeFlowFunction, {
      [flowieSignature]: {
        flowieContainer,
        preparedFlowieManager: preparedFlowieManager
      } as FlowieSignature
    })
  )
}

export function isSignedAsFlowieFunction (flowFunction: Function): boolean {
  return Boolean(flowFunction) && flowieSignature in flowFunction
}

export function getFlowieContainer (flowFunction: Flowie<any, any>): FlowieContainer {
  return flowFunction[flowieSignature].flowieContainer
}

export function getFlowieDeclarationManager (flowFunction: Flowie<any, any>): PreparedFlowieManager {
  return flowFunction[flowieSignature].preparedFlowieManager
}

interface FlowieSignature {
  readonly flowieContainer: FlowieContainer
  readonly preparedFlowieManager: PreparedFlowieManager
}
