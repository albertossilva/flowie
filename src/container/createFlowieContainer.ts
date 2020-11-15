import { BeforeAll } from 'cucumber'
import { FlowFunctionDetailsWithItem, FlowFunction, FlowItem, GeneratorFunctionDetails } from '../runtime.types'

import buildFlowFunctionDetails, { isRegisteredFlowFunctionDetail } from './buildFlowFunctionDetails'

const flowieContainerSignature = Symbol('flowieContainerSignature')

type AliasFunction = readonly [string, FlowFunction]
type PossibleFunctionRegister = FlowFunction | AliasFunction | GeneratorFunctionDetails

type FunctionsContainer = Record<string, FlowFunctionDetailsWithItem>

export interface FlowieContainer {
  readonly latestDetailsAdded: ReadonlyArray<FlowFunctionDetailsWithItem>
  readonly allFunctionsNames: ReadonlySet<string>
  readonly functionsContainer: FunctionsContainer
  // readonly getFunctionDetails: (functionToFind: PossibleFunctionRegister) => FlowFunctionDetailsWithItem
  readonly isAsyncFunction: (functionName: string) => boolean
  readonly isGeneratorFunction: (functionName: string) => boolean
  readonly register: (...possibleFunctionRegister: ReadonlyArray<PossibleFunctionRegister>) => FlowieContainer
  readonly merge: (...containersOrFunctions: ReadonlyArray<FlowieContainer | FlowFunction>) => FlowieContainer
}

export default function createFlowieContainer(): FlowieContainer {
  const flowieContainer = {
    [flowieContainerSignature]: flowieContainerSignature,
    latestDetailsAdded: [],
    allFunctionsNames: new Set<string>(),
    functionsContainer: Object.freeze({}),
    // getFunctionDetails() {
    //   return null
    // },
    isAsyncFunction() {
      return false
    },
    isGeneratorFunction() {
      return false
    },

    register(...possibleFunctionRegister: ReadonlyArray<PossibleFunctionRegister>): FlowieContainer {
      return registerFlowFunctionsList({}, ...possibleFunctionRegister)
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

    // getFunctionDetails(functionToFind: FlowItem) {
    //   return Object.values(functionsContainer).find(matchFlowFunction(functionToFind))
    // },
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

// function matchFlowFunction(functionToFind: FlowFunction) {
//   return function bla(flowFunctionDetailsWithItem: FlowFunctionDetailsWithItem) {
//     return flowFunctionDetailsWithItem.flowFunction === functionToFind
//   }
// }

export function isFlowieContainer(possibleFlowieContainer: FlowieContainer): boolean {
  return Boolean(possibleFlowieContainer) && flowieContainerSignature in possibleFlowieContainer
}

function registerFlowFunctionsList(
  previousFunctionsContainer: FunctionsContainer,
  ...possibleFunctionRegister: ReadonlyArray<PossibleFunctionRegister>
): FlowieContainer {
  const initialFunctionRegister = {
    functions: new Map<FlowFunction, string>(Object.values(previousFunctionsContainer).map(getFunctionAsKey)),
    functionsDetailsList: [] as ReadonlyArray<FlowFunctionDetailsWithItem>,
  }

  const { functionsDetailsList, functions } = possibleFunctionRegister.reduce(
    addOnUniqueFunctionDetailsWhenNew,
    initialFunctionRegister,
  )

  const newFunctionsContainer: Record<string, FlowFunctionDetailsWithItem> = Object.fromEntries(
    functionsDetailsList.map(getNameAsKey),
  ) as Record<string, FlowFunctionDetailsWithItem>

  const container: FunctionsContainer = { ...previousFunctionsContainer, ...newFunctionsContainer }
  const latestDetailsAdded = possibleFunctionRegister.map(getFunctionDetail(functions, container))

  return createContainer(container, latestDetailsAdded)
}

function getFunctionAsKey(functionDetails: FlowFunctionDetailsWithItem): readonly [FlowFunction, string] {
  return [functionDetails.flowFunction, functionDetails.name]
}

function getNameAsKey(functionDetails: FlowFunctionDetailsWithItem): readonly [string, FlowFunctionDetailsWithItem] {
  return [functionDetails.name, functionDetails]
}

function getFunctionDetail(functions: ReadonlyMap<FlowFunction, string>, container: FunctionsContainer) {
  return function bla(possibleFunctionRegister: PossibleFunctionRegister) {
    if (Array.isArray(possibleFunctionRegister)) {
      const [, flowFunction] = possibleFunctionRegister

      return container[functions.get(flowFunction)]
    }

    return container[functions.get(possibleFunctionRegister as FlowFunction)]
  }
}

interface UniqueFunctionDetails {
  readonly functions: ReadonlyMap<FlowFunction, string>
  readonly functionsDetailsList: ReadonlyArray<FlowFunctionDetailsWithItem>
}

// eslint-disable-next-line complexity
function addOnUniqueFunctionDetailsWhenNew(
  uniqueFunctionsDetails: UniqueFunctionDetails,
  candidateToRegister: PossibleFunctionRegister,
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
      readonly functionToRegister?: {
        readonly name: string
        readonly flowFunction: FlowFunction
      }
    }
  | {
      readonly shouldBeAdded: false
    }

function checkCandidateToRegister(
  uniqueFunctionsDetails: UniqueFunctionDetails,
  candidateToRegister: PossibleFunctionRegister,
): CandidateToRegisterCheck {
  if (PossibleAddingRegister.AliasFunctionTuple.isNewFunction(candidateToRegister)) {
    const { name, flowFunction } = PossibleAddingRegister.FlowFunction.getFunctionDetails(
      candidateToRegister as FlowFunction,
    )

    return {
      shouldBeAdded: true,
      functionToRegister: { name, flowFunction },
    }
  }

  if (PossibleAddingRegister.FlowFunction.isNewFunction(candidateToRegister, uniqueFunctionsDetails)) {
    const { name, flowFunction } = PossibleAddingRegister.FlowFunction.getFunctionDetails(
      candidateToRegister as FlowFunction,
    )

    return {
      shouldBeAdded: true,
      functionToRegister: { name, flowFunction },
    }
  }

  return { shouldBeAdded: false }
}

const PossibleAddingRegister = {
  FlowFunction: {
    isNewFunction(candidateToRegister: PossibleFunctionRegister, uniqueFunctionsDetails: UniqueFunctionDetails) {
      return typeof candidateToRegister !== 'function' || uniqueFunctionsDetails.functions.has(candidateToRegister)
    },
    getFunctionDetails(flowFunction: FlowFunction) {
      const name = getNameForFunction(flowFunction)

      return { name, flowFunction }
    },
  },
  AliasFunctionTuple: {
    isNewFunction(candidateToRegister: PossibleFunctionRegister) {
      return Array.isArray(candidateToRegister)
    },
    getFunctionDetails(aliasFunction: AliasFunction) {
      const [alias, flowFunction] = aliasFunction

      return { name: alias, flowFunction }
    },
  },
}

function getNameForFunction(flowFunction: FlowFunction): string {
  const randomValue = Math.random().toString(36).slice(2)
  const name = flowFunction.name

  return name || `anonymous_${randomValue}`
}
