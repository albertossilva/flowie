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
  readonly pipe: PipeDeclaration
  readonly split: (
    declarationManagerOrFunctionDetailsList: readonly (FlowDeclarationManager | FlowFunctionDetails)[]
  ) => FlowDeclarationManager
}

interface PipeDeclaration {
  (flowFunctionDetails: FlowFunctionDetails): FlowDeclarationManager
  (flowieExecutionDeclaration: FlowieExecutionDeclaration): FlowDeclarationManager
  (flowieExecutionDeclaration: FlowFunctionDetails | FlowieExecutionDeclaration): FlowDeclarationManager
  (nextFlowieExecuteDeclaration: FlowDeclarationManager): FlowDeclarationManager
}

function createFlowieDeclarationManagerRuntime<Argument, Result> (
  flowDeclaration: FlowieExecutionDeclaration
): FlowDeclarationManager {
  return Object.freeze({
    ...flowDeclaration,
    pipe (flowFunctionDetailsOrflowieExecuteDeclaration: FlowFunctionDetails | FlowieExecutionDeclaration) {
      const nextFlowieExecuteDeclaration = flowFunctionDetailsOrflowieExecuteDeclaration as FlowieExecutionDeclaration
      if (isFlowieExecutionDeclaration(nextFlowieExecuteDeclaration)) {
        const nextFlowDeclaration: FlowieExecutionDeclaration = mergeDeclarations(
          flowDeclaration,
          nextFlowieExecuteDeclaration
        )
        return createFlowieDeclarationManagerRuntime(nextFlowDeclaration)
      }

      const flowFunctionDetails = flowFunctionDetailsOrflowieExecuteDeclaration as FlowFunctionDetails

      return createFlowDeclarationManager([flowFunctionDetails], flowDeclaration)
    },
    split (declarationManagerOrFunctionDetailsList: readonly (FlowDeclarationManager | FlowFunctionDetails)[]) {
      return createFlowDeclarationManager(declarationManagerOrFunctionDetailsList, flowDeclaration)
    }
  })
}

export function isFlowieExecutionDeclaration (flowieExecutionDeclarationCandidate: FlowieExecutionDeclaration) {
  return typeof flowieExecutionDeclarationCandidate.isAsync === 'boolean' &&
    Array.isArray(flowieExecutionDeclarationCandidate.flows) &&
    flowieExecutionDeclarationCandidate.allFunctionsNames instanceof Set
}

function mergeDeclarations (
  previousDeclaration: FlowieExecutionDeclaration,
  nextDeclaration: FlowieExecutionDeclaration
): FlowieExecutionDeclaration {
  return {
    isAsync: previousDeclaration.isAsync || nextDeclaration.isAsync,
    allFunctionsNames: new Set([...previousDeclaration.allFunctionsNames, ...nextDeclaration.allFunctionsNames]),
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
      allFunctionsNames: new Set<string>()
    } as FlowDeclarationAttributes<Argument, Result>
  )

  if (!previousDeclaration) {
    return {
      isAsync: isAsync,
      allFunctionsNames: allFunctionsNames,
      flows: [createFlowElementFromElements(flowElements)]
    }
  }

  return {
    isAsync: previousDeclaration.isAsync || isAsync,
    allFunctionsNames: new Set([...previousDeclaration.allFunctionsNames, ...allFunctionsNames]),
    flows: previousDeclaration.flows.concat(createFlowElementFromElements(flowElements))
  }
}

function mergeFlowDeclarationAttributes<Argument, Result> (
  flowDeclarationAttributes: FlowDeclarationAttributes<Argument, Result>,
  declarationManagerOrFunctionDetails: DeclarationManagerOrFunctionDetails<Argument, Result>
): FlowDeclarationAttributes<Argument, Result> {
  return {
    isAsync: flowDeclarationAttributes.isAsync || declarationManagerOrFunctionDetails.isAsync,
    allFunctionsNames:
      new Set([
        ...flowDeclarationAttributes.allFunctionsNames,
        ...getFunctionNames(declarationManagerOrFunctionDetails)
      ]),
    flowElements: flowDeclarationAttributes.flowElements.concat(getFlowElement(declarationManagerOrFunctionDetails))
  }
}

function createFlowElementFromElements (
  flowElements: readonly (FlowieDeclaration | FlowFunctionDetails)[]
): FlowElement {
  if (flowElements.length === 1) {
    const [firstFlowElement] = flowElements
    const flowieDeclaration = (firstFlowElement as FlowieDeclaration)
    if (flowieDeclaration.flows) {
      return flowieDeclaration
    }

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
  if (isFlowieExecutionDeclaration(flowDeclaration)) {
    return Array.from(flowDeclaration.allFunctionsNames)
  }

  const flowFunctionDetails = declarationManagerOrFunctionDetails as FlowFunctionDetails

  return [flowFunctionDetails.name]
}

function getFlowElement<Argument, Result> (
  declarationManagerOrFunctionDetails: DeclarationManagerOrFunctionDetails<Argument, Result>
): FlowieDeclaration | FlowFunctionDetails<Argument, Result> {
  const flowDeclaration = declarationManagerOrFunctionDetails as FlowDeclarationManager
  if (isFlowieExecutionDeclaration(flowDeclaration)) {
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
  readonly allFunctionsNames: ReadonlySet<string>
  readonly flowElements: readonly (FlowieDeclaration | FlowFunctionDetails<Argument, Result>)[]
}
