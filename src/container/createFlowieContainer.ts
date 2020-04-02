import { Set } from 'immutable'

import { FlowItem, FlowFunctionDetailsWithItem } from '../types'

export default function createFlowieContainer (): FlowieContainer {
  return {
    latestDetailsAdded: [],
    allFunctionsNames: Set<string>(),
    functionsContainer: Object.freeze({}),
    register (...possibleFunctionRegister: readonly PossibleFunctionRegister[]): FlowieContainer {
      return registerFlowieItem({}, ...possibleFunctionRegister)
    }
  }
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

  return {
    latestDetailsAdded: functionsDetailsList,
    allFunctionsNames: Set<string>(Object.keys(newFunctionsContainer)),
    functionsContainer: Object.freeze(newFunctionsContainer),
    register: registerFlowieItem.bind(null, newFunctionsContainer)
  }
}

function getFunctionDetail (
  possibleFunctionRegister: PossibleFunctionRegister
): FlowFunctionDetailsWithItem {
  if (typeof possibleFunctionRegister === 'function') {
    return {
      name: possibleFunctionRegister.name,
      flowItem: possibleFunctionRegister
    }
  }

  const [name, flowItem] = possibleFunctionRegister

  return { name, flowItem }
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
