import { FlowieContainer } from '../container/createFlowieContainer'
import { FlowDeclarationManager } from '../declaration/createFlowDeclarationManager'
import { Flowie } from '../types'

const flowieSignature = Symbol('flowieSignature')

export function signAsFlowieFunction<T> (
  executeFlowFunction: T,
  flowieContainer: FlowieContainer,
  flowDeclarationManager: FlowDeclarationManager
): T {
  return Object.freeze(
    // eslint-disable-next-line functional/immutable-data
    Object.assign(executeFlowFunction, {
      [flowieSignature]: {
        flowieContainer,
        flowDeclarationManager
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

export function getFlowieDeclarationManager (flowFunction: Flowie<any, any>): FlowDeclarationManager {
  return flowFunction[flowieSignature].flowDeclarationManager
}

interface FlowieSignature {
  readonly flowieContainer: FlowieContainer
  readonly flowDeclarationManager: FlowDeclarationManager
}
