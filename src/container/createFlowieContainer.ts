import { FlowFunctionDetailsWithItem, FlowFunction, GeneratorFunctionDetails } from '../runtime.types'

import {
  FunctionToRegister,
  getFlowFunction,
  getFunctionToRegister,
  PossibleFunctionToRegister,
  UniqueFunctionDetails,
} from './possibleFunctionToRegister'

import buildFlowFunctionDetails from './buildFlowFunctionDetails'

const flowieContainerSignature = Symbol('flowieContainerSignature')

type FunctionsContainer = Record<string, FlowFunctionDetailsWithItem>

export interface FlowieContainer {
  readonly latestDetailsAdded: ReadonlyArray<FlowFunctionDetailsWithItem>
  readonly allFunctionsNames: ReadonlySet<string>
  readonly functionsContainer: FunctionsContainer
  readonly getFunctionDetails: (
    functionToFind: FlowFunction | GeneratorFunctionDetails,
  ) => FlowFunctionDetailsWithItem | null
  readonly isAsyncFunction: (functionName: string) => boolean
  readonly isGeneratorFunction: (functionName: string) => boolean
  readonly register: (...possibleFunctionToRegister: ReadonlyArray<PossibleFunctionToRegister>) => FlowieContainer
  readonly merge: (...containersOrFunctions: ReadonlyArray<FlowieContainer | FlowFunction>) => FlowieContainer
}

export default function createFlowieContainer(): FlowieContainer {
  const flowieContainer = {
    [flowieContainerSignature]: flowieContainerSignature,
    latestDetailsAdded: [],
    allFunctionsNames: new Set<string>(),
    functionsContainer: Object.freeze({}),
    getFunctionDetails() {
      return null
    },
    isAsyncFunction() {
      return false
    },
    isGeneratorFunction() {
      return false
    },

    register(...possibleFunctionToRegister: ReadonlyArray<PossibleFunctionToRegister>): FlowieContainer {
      return registerFlowFunctionsList({}, ...possibleFunctionToRegister)
    },
    merge(...containersOrFunctions: ReadonlyArray<FlowieContainer | FlowFunction>): FlowieContainer {
      return mergeWithOtherContainerAndFunctions(createFlowieContainer(), ...containersOrFunctions)
    },
  }
  return Object.freeze(flowieContainer as FlowieContainer)
}

function mergeWithOtherContainerAndFunctions(
  previousFunctionsContainer: FlowieContainer,
  ...containersOrFunctions: ReadonlyArray<FlowieContainer | FlowFunction>
): FlowieContainer {
  return containersOrFunctions.reduce<FlowieContainer>(
    mergeWithOtherContainerOrRegisterFunctions,
    previousFunctionsContainer,
  )
}

function mergeWithOtherContainerOrRegisterFunctions(
  mergedContainer: FlowieContainer,
  flowieContainerOrFunction: FlowieContainer | FlowFunction,
): FlowieContainer {
  const flowieContainer = flowieContainerOrFunction as FlowieContainer
  if (!isFlowieContainer(flowieContainer)) {
    return mergedContainer.register(flowieContainerOrFunction as FlowFunction)
  }

  const container = { ...mergedContainer.functionsContainer, ...flowieContainer.functionsContainer }
  const latestDetailsAdded = mergedContainer.latestDetailsAdded.concat(flowieContainer.latestDetailsAdded)

  return createContainer(container, latestDetailsAdded)
}

function createContainer(
  functionsContainer: FunctionsContainer,
  flowFunctionDetailsList: ReadonlyArray<FlowFunctionDetailsWithItem>,
) {
  const newFlowieContainer = {
    [flowieContainerSignature]: flowieContainerSignature,
    latestDetailsAdded: flowFunctionDetailsList,
    allFunctionsNames: new Set<string>(Object.keys(functionsContainer)),
    functionsContainer: Object.freeze(functionsContainer),

    getFunctionDetails(functionToFind: FlowFunction | GeneratorFunctionDetails): FlowFunctionDetailsWithItem | null {
      const flowFunctionToFind = getFlowFunction(functionToFind)

      const flowFunctionDetails = Object.values(functionsContainer).find(matchFlowFunction(flowFunctionToFind))

      return {
        ...flowFunctionDetails,
        parallelExecutions: (functionToFind as GeneratorFunctionDetails).parallelExecutions || 1,
      }
    },
    isAsyncFunction(functionName: string) {
      return functionsContainer[functionName].isAsync
    },
    isGeneratorFunction(functionName: string) {
      return functionsContainer[functionName].isGenerator
    },
    register: registerFlowFunctionsList.bind(null, functionsContainer),
  }

  const finalContainer: FlowieContainer = Object.assign(
    { merge: mergeWithOtherContainerAndFunctions.bind(null, newFlowieContainer) },
    newFlowieContainer,
  )

  return Object.freeze(finalContainer)
}

function matchFlowFunction(functionToFind: FlowFunction) {
  return function matchFlowFunctionWithFlowFunctionDetails(flowFunctionDetailsWithItem: FlowFunctionDetailsWithItem) {
    return flowFunctionDetailsWithItem.flowFunction === functionToFind
  }
}

export function isFlowieContainer(possibleFlowieContainer: FlowieContainer): boolean {
  return Boolean(possibleFlowieContainer) && flowieContainerSignature in possibleFlowieContainer
}

function registerFlowFunctionsList(
  previousFunctionsContainer: FunctionsContainer,
  ...possibleFunctionToRegister: ReadonlyArray<PossibleFunctionToRegister>
): FlowieContainer {
  const initialFunctionRegister = {
    functions: new Map<FlowFunction, string>(Object.values(previousFunctionsContainer).map(getFunctionAsKey)),
    functionsDetailsList: [] as ReadonlyArray<FlowFunctionDetailsWithItem>,
  }

  const { functionsDetailsList, functions } = possibleFunctionToRegister.reduce(
    addOnUniqueFunctionDetailsWhenNew,
    initialFunctionRegister,
  )

  const newFunctionsContainer: Record<string, FlowFunctionDetailsWithItem> = Object.fromEntries(
    functionsDetailsList.map(getNameAsKey),
  ) as Record<string, FlowFunctionDetailsWithItem>

  const container: FunctionsContainer = { ...previousFunctionsContainer, ...newFunctionsContainer }
  const latestDetailsAdded = possibleFunctionToRegister.map(getFunctionDetail(functions, container))

  return createContainer(container, latestDetailsAdded)
}

function getFunctionAsKey(functionDetails: FlowFunctionDetailsWithItem): readonly [FlowFunction, string] {
  return [functionDetails.flowFunction, functionDetails.name]
}

function getNameAsKey(functionDetails: FlowFunctionDetailsWithItem): readonly [string, FlowFunctionDetailsWithItem] {
  return [functionDetails.name, functionDetails]
}

function getFunctionDetail(functions: ReadonlyMap<FlowFunction, string>, container: FunctionsContainer) {
  return function bla(possibleFunctionToRegister: PossibleFunctionToRegister) {
    if (Array.isArray(possibleFunctionToRegister)) {
      const [, flowFunction] = possibleFunctionToRegister

      return container[functions.get(flowFunction)]
    }

    return container[functions.get(possibleFunctionToRegister as FlowFunction)]
  }
}

// eslint-disable-next-line complexity
function addOnUniqueFunctionDetailsWhenNew(
  uniqueFunctionsDetails: UniqueFunctionDetails,
  candidateToRegister: PossibleFunctionToRegister,
): UniqueFunctionDetails {
  const candidateChecked = checkCandidateToRegister(uniqueFunctionsDetails, candidateToRegister)

  if (!candidateChecked.shouldBeAdded) {
    return uniqueFunctionsDetails
  }

  const { name, flowFunction } = candidateChecked.functionToRegister

  const flowFunctionDetailsList = buildFlowFunctionDetails(name, flowFunction)

  return incrementUniqueFunctionDetails(uniqueFunctionsDetails, [flowFunction, name], flowFunctionDetailsList)
}

function incrementUniqueFunctionDetails(
  uniqueFunctionDetails: UniqueFunctionDetails,
  [flowFunction, name]: readonly [FlowFunction, string],
  functionsDetails: FlowFunctionDetailsWithItem,
): UniqueFunctionDetails {
  return {
    functions: new Map([...uniqueFunctionDetails.functions.entries(), [flowFunction, name]]),
    functionsDetailsList: uniqueFunctionDetails.functionsDetailsList.concat(functionsDetails),
  }
}

type CandidateToRegisterCheck =
  | {
      readonly shouldBeAdded: true
      readonly functionToRegister?: FunctionToRegister
    }
  | {
      readonly shouldBeAdded: false
    }

function checkCandidateToRegister(
  uniqueFunctionsDetails: UniqueFunctionDetails,
  candidateToRegister: PossibleFunctionToRegister,
): CandidateToRegisterCheck {
  const functionToRegister = getFunctionToRegister(uniqueFunctionsDetails, candidateToRegister)

  if (!functionToRegister) {
    return { shouldBeAdded: false }
  }

  return { shouldBeAdded: true, functionToRegister }
}
