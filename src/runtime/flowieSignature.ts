import { FlowieContainer } from '../container/createFlowieContainer'
import { PreparedFlowieManager } from '../declaration/createFlowDeclarationManager'
import { Flowie, FlowItem } from '../runtime.types'

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

export function isSignedAsFlowieFunction (flowieItem: FlowItem): boolean {
  return Boolean(flowieItem) && flowieSignature in flowieItem
}

export function getFlowieContainer (flowie: Flowie<unknown, unknown>): FlowieContainer {
  return flowie[flowieSignature].flowieContainer
}

export function getFlowieDeclarationManager (flowie: Flowie<unknown, unknown>): PreparedFlowieManager {
  return flowie[flowieSignature].preparedFlowieManager
}

interface FlowieSignature {
  readonly flowieContainer: FlowieContainer
  readonly preparedFlowieManager: PreparedFlowieManager
}
