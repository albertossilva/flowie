import { Set as ImmutableSet } from 'immutable'

import {
  FlowieExecutionDeclaration,
  FlowFunctionDetails,
  FlowElement,
  FlowieDeclaration,
  FlowieItemDeclaration
} from '../types'

export default function createFlowDeclarationManager<Argument, Result> (
  flowDeclarationOrFunctionList: readonly DeclarationManagerOrFunctionDetails<Argument, Result>[],
  previousDeclaration?: FlowieExecutionDeclaration
): FlowDeclarationManager {
  const flowDeclaration = addNextItemToFlowDeclaration(previousDeclaration, flowDeclarationOrFunctionList)

  return createFlowieDeclarationManagerRuntime<Argument, Result>(flowDeclaration)
}

export interface FlowDeclarationManager extends FlowieExecutionDeclaration {
  readonly pipe: (flowFunctionDetails: FlowFunctionDetails) => FlowDeclarationManager
  readonly pipeDeclaration: (nextFlowieExecuteDeclaration: FlowDeclarationManager) => FlowDeclarationManager
  readonly split: (
    declarationManagerOrFunctionDetailsList: readonly (FlowDeclarationManager | FlowFunctionDetails)[]
  ) => FlowDeclarationManager
}

function createFlowieDeclarationManagerRuntime<Argument, Result> (
  flowDeclaration: FlowieExecutionDeclaration
): FlowDeclarationManager {
  return Object.freeze({
    ...flowDeclaration,
    pipe (flowFunctionDetails: FlowFunctionDetails) {
      return createFlowDeclarationManager([flowFunctionDetails], flowDeclaration)
    },
    pipeDeclaration (nextFlowieExecuteDeclaration: FlowieExecutionDeclaration) {
      const nextFlowDeclaration: FlowieExecutionDeclaration = mergeDeclarations(
        flowDeclaration,
        nextFlowieExecuteDeclaration
      )
      return createFlowieDeclarationManagerRuntime(nextFlowDeclaration)
    },
    split (declarationManagerOrFunctionDetailsList: readonly (FlowDeclarationManager | FlowFunctionDetails)[]) {
      return createFlowDeclarationManager(declarationManagerOrFunctionDetailsList, flowDeclaration)
    }
  })
}

function mergeDeclarations (
  previousDeclaration: FlowieExecutionDeclaration,
  nextDeclaration: FlowieExecutionDeclaration
): FlowieExecutionDeclaration {
  return {
    isAsync: previousDeclaration.isAsync || nextDeclaration.isAsync,
    allFunctionsNames: previousDeclaration.allFunctionsNames.concat(nextDeclaration.allFunctionsNames),
    flows: previousDeclaration.flows.concat({ flows: nextDeclaration.flows })
  }
}

function addNextItemToFlowDeclaration<Argument, Result> (
  previousDeclaration: FlowieExecutionDeclaration | null,
  flowDeclarationOrFunctionList: readonly DeclarationManagerOrFunctionDetails<Argument, Result>[]
): FlowieExecutionDeclaration {
  const { isAsync, allFunctionsNames, flowElements } = flowDeclarationOrFunctionList.reduce(
    mergeFlowDeclarationAttributes, {
      isAsync: false,
      flowElements: [],
      allFunctionsNames: ImmutableSet<string>()
    } as FlowDeclarationAttributes<Argument, Result>
  )

  if (!previousDeclaration) {
    return {
      isAsync: isAsync,
      allFunctionsNames: allFunctionsNames,
      flows: [createPipeOrSplitFlow(flowElements)]
    }
  }

  return {
    isAsync: previousDeclaration.isAsync || isAsync,
    allFunctionsNames: previousDeclaration.allFunctionsNames.concat(allFunctionsNames),
    flows: previousDeclaration.flows.concat(createPipeOrSplitFlow(flowElements))
  }
}

function mergeFlowDeclarationAttributes<Argument, Result> (
  flowDeclarationAttributes: FlowDeclarationAttributes<Argument, Result>,
  declarationManagerOrFunctionDetails: DeclarationManagerOrFunctionDetails<Argument, Result>
): FlowDeclarationAttributes<Argument, Result> {
  return {
    isAsync: flowDeclarationAttributes.isAsync || declarationManagerOrFunctionDetails.isAsync,
    allFunctionsNames: flowDeclarationAttributes.allFunctionsNames.concat(
      getFunctionNames(declarationManagerOrFunctionDetails)
    ),
    flowElements: flowDeclarationAttributes.flowElements.concat(getFlowElement(declarationManagerOrFunctionDetails))
  }
}

function createPipeOrSplitFlow (flowElements: readonly (FlowieDeclaration | FlowFunctionDetails)[]): FlowElement {
  if (flowElements.length === 1) {
    const [firstFlowElement] = flowElements

    return {
      pipe: (firstFlowElement as FlowFunctionDetails).name
    }
  }

  return {
    split: flowElements.map(getNameOrFlowieDeclaration)
  }
}

function getFunctionNames (declarationManagerOrFunctionDetails: DeclarationManagerOrFunctionDetails<any, any>) {
  const flowDeclaration = declarationManagerOrFunctionDetails as FlowDeclarationManager
  if (flowDeclaration.allFunctionsNames) {
    return flowDeclaration.allFunctionsNames.toJS() as readonly string[]
  }

  const flowFunctionDetails = declarationManagerOrFunctionDetails as FlowFunctionDetails

  return [flowFunctionDetails.name]
}

function getFlowElement<Argument, Result> (
  declarationManagerOrFunctionDetails: DeclarationManagerOrFunctionDetails<Argument, Result>
): FlowieDeclaration | FlowFunctionDetails<Argument, Result> {
  const flowDeclaration = declarationManagerOrFunctionDetails as FlowDeclarationManager
  if (flowDeclaration.allFunctionsNames) {
    return { flows: flowDeclaration.flows, name: flowDeclaration.name }
  }

  return declarationManagerOrFunctionDetails as FlowFunctionDetails
}

function getNameOrFlowieDeclaration (flowElement: FlowieDeclaration | FlowFunctionDetails): FlowieItemDeclaration {
  const flowieDeclaration = flowElement as FlowieDeclaration

  if (flowieDeclaration.flows) {
    return flowieDeclaration
  }

  return (flowElement as FlowFunctionDetails).name
}

type DeclarationManagerOrFunctionDetails<Argument, Result> = FlowDeclarationManager
  | FlowFunctionDetails<Argument, Result>

interface FlowDeclarationAttributes<Argument, Result> {
  readonly isAsync: boolean
  readonly allFunctionsNames: ImmutableSet<string>
  readonly flowElements: readonly (FlowieDeclaration | FlowFunctionDetails<Argument, Result>)[]
}
