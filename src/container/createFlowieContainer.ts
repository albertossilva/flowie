import { Set as ImmutableSet, Map as ImmutableMap } from 'immutable'

import { FlowFunctionDetailsWithItem, FlowFunction } from '../types'
import { isAsyncFunction } from '../functionConstructors'

const flowieContainerSignature = Symbol('flowieContainerSignature')

export default function createFlowieContainer (): FlowieContainer {
  const flowieContainer = {
    [flowieContainerSignature]: flowieContainerSignature,
    latestDetailsAdded: [],
    allFunctionsNames: ImmutableSet<string>(),
    functionsContainer: Object.freeze({}),
    register (...possibleFunctionRegister: readonly PossibleFunctionRegister[]): FlowieContainer {
      return registerFlowFunctionsList({}, ...possibleFunctionRegister)
    },
    merge (...containersOrFunctions: readonly (FlowieContainer | FlowFunction)[]): FlowieContainer {
      return mergeWithOtherContainerAndFunctions(createFlowieContainer(), ...containersOrFunctions)
    },
    getFunctionDetails () { return null },
    isAsyncFunction () { return false }
  }
  return Object.freeze(flowieContainer as FlowieContainer)
}

export function isFlowieContainer (possibleFlowieContainer: FlowieContainer) {
  return Boolean(possibleFlowieContainer) && flowieContainerSignature in possibleFlowieContainer
}

export interface FlowieContainer {
  readonly getFunctionDetails: (functionToFind: Function) => FlowFunctionDetailsWithItem
  readonly latestDetailsAdded: readonly FlowFunctionDetailsWithItem[]
  readonly allFunctionsNames: ReadonlySet<string>
  readonly functionsContainer: FunctionsContainer
  readonly register: (...possibleFunctionRegister: readonly PossibleFunctionRegister[]) => FlowieContainer;
  readonly merge: (...containersOrFunctions: readonly (FlowieContainer | FlowFunction)[]) => FlowieContainer;
  readonly isAsyncFunction: (functionName: string) => boolean;
}

function registerFlowFunctionsList (
  previousFunctionsContainer: FunctionsContainer,
  ...possibleFunctionRegister: readonly PossibleFunctionRegister[]
): FlowieContainer {
  const initialFunctionRegister = {
    functions: ImmutableMap<Function, string>(Object.values(previousFunctionsContainer).map(getFunctionAsKey) as any),
    functionsDetailsList: [] as readonly FlowFunctionDetailsWithItem[]
  }

  const { functionsDetailsList, functions } = possibleFunctionRegister
    .reduce(getUniqueFunctionDetails, initialFunctionRegister)

  const newFunctionsContainer: Record<string, FlowFunctionDetailsWithItem> = Object
    .fromEntries(functionsDetailsList.map(getNameAsKey)) as Record<string, FlowFunctionDetailsWithItem>

  const container = { ...previousFunctionsContainer, ...newFunctionsContainer }
  const latestDetailsAdded = possibleFunctionRegister.map(getFunctionDetail, { functions, container })

  return createContainer(container, latestDetailsAdded)
}

function mergeWithOtherContainerAndFunctions (
  previousFunctionsContainer: FlowieContainer,
  ...containersOrFunctions: readonly (FlowieContainer | FlowFunction)[]
): FlowieContainer {
  return containersOrFunctions.reduce<FlowieContainer>(
    mergeWithOtherContainerOrRegisterFunctions,
    previousFunctionsContainer
  )
}

interface UniqueFunctionDetails {
  readonly functions: ImmutableMap<Function, string>,
  readonly functionsDetailsList: readonly FlowFunctionDetailsWithItem[]
}

function getUniqueFunctionDetails (
  uniqueFunctionsDetails: UniqueFunctionDetails,
  possibleFunctionRegister: PossibleFunctionRegister
): UniqueFunctionDetails {
  if (Array.isArray(possibleFunctionRegister)) {
    const [name, flowFunction] = possibleFunctionRegister

    return getFlowFunctionDetailsForTuple(name, flowFunction, uniqueFunctionsDetails)
  }

  if (
    typeof possibleFunctionRegister === 'function' &&
    !uniqueFunctionsDetails.functions.has(possibleFunctionRegister)
  ) {
    return getFlowFunctionDetailsForFlowFunction(possibleFunctionRegister, uniqueFunctionsDetails)
  }

  return uniqueFunctionsDetails
}

function getFlowFunctionDetailsForFlowFunction (
  flowFunction: FlowFunction<any, any>,
  uniqueFunctionDetails: UniqueFunctionDetails
) {
  const name = getNameForFunction(flowFunction)

  const flowFunctionDetails = {
    name,
    flowFunction,
    isAsync: isAsyncFunction(flowFunction)
  }

  return {
    functions: uniqueFunctionDetails.functions.set(flowFunction, name),
    functionsDetailsList: uniqueFunctionDetails.functionsDetailsList.concat(flowFunctionDetails)
  }
}

function getFlowFunctionDetailsForTuple (
  name: string,
  flowFunction: FlowFunction,
  uniqueFunctions: UniqueFunctionDetails
) {
  const isSaved = uniqueFunctions.functions.has(flowFunction)
  const newName = isSaved ? uniqueFunctions.functions.get(flowFunction) : name
  const flowFunctionDetails = { name, flowFunction, isAsync: isAsyncFunction(flowFunction) }

  return {
    functions: uniqueFunctions.functions.set(flowFunction, newName),
    functionsDetailsList: uniqueFunctions.functionsDetailsList.concat(flowFunctionDetails)
  }
}

function mergeWithOtherContainerOrRegisterFunctions (
  mergedContainer: FlowieContainer,
  flowieContainerOrFunction: FlowieContainer | FlowFunction
): FlowieContainer {
  const flowieContainer = flowieContainerOrFunction as FlowieContainer
  if (!isFlowieContainer(flowieContainer)) {
    return mergedContainer.register(flowieContainerOrFunction as FlowFunction)
  }

  const container = { ...mergedContainer.functionsContainer, ...flowieContainer.functionsContainer }
  const latestDetailsAdded = mergedContainer.latestDetailsAdded.concat(flowieContainer.latestDetailsAdded)

  return createContainer(container, latestDetailsAdded)
}

function createContainer (
  functionsContainer: FunctionsContainer,
  flowFunctionDetailsList: readonly FlowFunctionDetailsWithItem<any, any> []
) {
  const newFlowieContainer = {
    [flowieContainerSignature]: flowieContainerSignature,
    latestDetailsAdded: flowFunctionDetailsList,
    allFunctionsNames: ImmutableSet<string>(Object.keys(functionsContainer)),
    functionsContainer: Object.freeze(functionsContainer),
    register: registerFlowFunctionsList.bind(null, functionsContainer),
    isAsyncFunction (functionName: string) {
      return functionsContainer[functionName].isAsync
    },
    getFunctionDetails (functionToFind: Function) {
      return Object.values(functionsContainer).find(matchFlowFunction, { functionToFind })
    }
  }

  const finalContainer: FlowieContainer = Object.assign(
    { merge: mergeWithOtherContainerAndFunctions.bind(null, newFlowieContainer) },
    newFlowieContainer
  )

  return Object.freeze(finalContainer)
}

function getNameAsKey (functionDetails: FlowFunctionDetailsWithItem): readonly [string, FlowFunctionDetailsWithItem] {
  return [functionDetails.name, functionDetails]
}

function getFunctionAsKey (
  functionDetails: FlowFunctionDetailsWithItem
): readonly [FlowFunction, string] {
  return [functionDetails.flowFunction, functionDetails.name]
}

function getNameForFunction (flowFunction: Function): string {
  const randomValue = Math.random().toString(36).slice(2)
  const name = flowFunction.name

  return name || `anoymous_${randomValue}`
}

function getFunctionDetail (
  this: { readonly functions: ImmutableMap<Function, string>, readonly container: FunctionsContainer },
  possibleFunctionRegister: PossibleFunctionRegister
) {
  if (Array.isArray(possibleFunctionRegister)) {
    const [, flowFunction] = possibleFunctionRegister

    return this.container[this.functions.get(flowFunction)]
  }

  return this.container[this.functions.get(possibleFunctionRegister as Function)]
}

function matchFlowFunction (
  this: { readonly functionToFind: Function },
  flowFunctionDetailsWithItem: FlowFunctionDetailsWithItem
) {
  return flowFunctionDetailsWithItem.flowFunction === this.functionToFind
}

type PossibleFunctionRegister = FlowFunction | readonly [string, FlowFunction]

type FunctionsContainer = Record<string, FlowFunctionDetailsWithItem>
