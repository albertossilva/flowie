import { Set } from 'immutable'

import { FlowItem, FlowFunctionDetailsWithItem } from '../types'
import { isAsyncFunction } from '../functionConstructors'

const flowieContainerSignature = Symbol('flowieContainerSignature')

export default function createFlowieContainer (): FlowieContainer {
  const flowieContainer = {
    [flowieContainerSignature]: flowieContainerSignature,
    latestDetailsAdded: [],
    allFunctionsNames: Set<string>(),
    functionsContainer: Object.freeze({}),
    register (...possibleFunctionRegister: readonly PossibleFunctionRegister[]): FlowieContainer {
      return registerFlowieItem({}, ...possibleFunctionRegister)
    }
  }
  return flowieContainer as FlowieContainer
}

export function isFlowieContainer (possibleFlowieContainer: FlowieContainer) {
  return Boolean(possibleFlowieContainer) && flowieContainerSignature in possibleFlowieContainer
}

function registerFlowieItem (
  previousFunctionsContainer: FunctionsContainer,
  ...possibleFunctionRegister: readonly PossibleFunctionRegister[]
): FlowieContainer {
  const functionsDetailsList = possibleFunctionRegister.map(getFunctionDetail)

  const newFunctionsContainer = {
    ...previousFunctionsContainer,
    ...Object.fromEntries(functionsDetailsList.map(getNameAsKey))
  }

  const flowieContainer = {
    [flowieContainerSignature]: flowieContainerSignature,
    latestDetailsAdded: functionsDetailsList,
    allFunctionsNames: Set<string>(Object.keys(newFunctionsContainer)),
    functionsContainer: Object.freeze(newFunctionsContainer),
    register: registerFlowieItem.bind(null, newFunctionsContainer)
  }

  return flowieContainer as FlowieContainer
}

function getFunctionDetail (
  possibleFunctionRegister: PossibleFunctionRegister
): FlowFunctionDetailsWithItem {
  if (typeof possibleFunctionRegister === 'function') {
    const name = possibleFunctionRegister.name.trim()
      ? possibleFunctionRegister.name.trim()
      : `anoymous${Math.random().toString(36).slice(2)}`

    return {
      name,
      flowItem: possibleFunctionRegister,
      isAsync: isAsyncFunction(possibleFunctionRegister)
    }
  }

  const [name, flowItem] = possibleFunctionRegister

  return { name, flowItem, isAsync: isAsyncFunction(flowItem) }
}

function getNameAsKey (functionDetails: FlowFunctionDetailsWithItem) {
  return [functionDetails.name, functionDetails]
}

export interface FlowieContainer {
  readonly latestDetailsAdded: readonly FlowFunctionDetailsWithItem[]
  readonly allFunctionsNames: ReadonlySet<string>
  readonly register: (...possibleFunctionRegister: readonly PossibleFunctionRegister[]) => FlowieContainer;
  readonly functionsContainer: FunctionsContainer
}

type PossibleFunctionRegister = FlowItem | readonly[string, FlowItem]

type FunctionsContainer = Record<string, FlowFunctionDetailsWithItem>
