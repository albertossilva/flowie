import { FlowFunctionDetails } from '../runtime.types'

import { PreparedFlowieExecution, FlowElement, PreparedFlowie, FlowieItemDeclaration } from '../prepared.types'

export default function createFlowDeclarationManager (
  flowDeclarationOrFunctionList: ReadonlyArray<DeclarationManagerOrFunctionDetails>,
  preparedFlowieExecution?: PreparedFlowieExecution
): PreparedFlowieManager {
  const flowDeclaration = addNextItemToFlowDeclaration(preparedFlowieExecution, flowDeclarationOrFunctionList)

  return createFlowieDeclarationManagerRuntime(flowDeclaration)
}

export interface PreparedFlowieManager extends PreparedFlowieExecution {
  readonly pipe: PipeDeclaration
  readonly split: (
    declarationManagerOrFunctionDetailsList: ReadonlyArray<PreparedFlowieManager | FlowFunctionDetails>
  ) => PreparedFlowieManager
}

interface PipeDeclaration {
  (flowFunctionDetails: FlowFunctionDetails): PreparedFlowieManager
  (preparedFlowieExecution: PreparedFlowieExecution): PreparedFlowieManager
  (flowieExecutionDeclarationOrDetail: FlowFunctionDetails | PreparedFlowieExecution): PreparedFlowieManager
  (nextFlowieExecuteDeclaration: PreparedFlowieManager): PreparedFlowieManager
}

function createFlowieDeclarationManagerRuntime (
  preparedFlowieExecution: PreparedFlowieExecution
): PreparedFlowieManager {
  return Object.freeze({
    ...preparedFlowieExecution,
    pipe (flowFunctionDetailsOrflowieExecuteDeclaration: FlowFunctionDetails | PreparedFlowieExecution) {
      const nextPreparedFlowieExecutionCandidate =
        flowFunctionDetailsOrflowieExecuteDeclaration as PreparedFlowieExecution

      if (isFlowieExecutionDeclaration(nextPreparedFlowieExecutionCandidate)) {
        const nextPreparedFlowieExecution: PreparedFlowieExecution = mergePreparedFlowies(
          preparedFlowieExecution,
          nextPreparedFlowieExecutionCandidate
        )
        return createFlowieDeclarationManagerRuntime(nextPreparedFlowieExecution)
      }

      const flowFunctionDetails = flowFunctionDetailsOrflowieExecuteDeclaration as FlowFunctionDetails

      return createFlowDeclarationManager([flowFunctionDetails], preparedFlowieExecution)
    },
    split (declarationManagerOrFunctionDetailsList: ReadonlyArray<PreparedFlowieManager | FlowFunctionDetails>) {
      return createFlowDeclarationManager(declarationManagerOrFunctionDetailsList, preparedFlowieExecution)
    }
  })
}

export function isFlowieExecutionDeclaration (preparedFlowieExecutionCandidate: PreparedFlowieExecution): boolean {
  return typeof preparedFlowieExecutionCandidate.isAsync === 'boolean' &&
    Array.isArray(preparedFlowieExecutionCandidate.flows) &&
    preparedFlowieExecutionCandidate.allFunctionsNames instanceof Set
}

function mergePreparedFlowies (
  preparedFlowieExecution: PreparedFlowieExecution,
  nextPreparedFlowieExecution: PreparedFlowieExecution
): PreparedFlowieExecution {
  return {
    isAsync: preparedFlowieExecution.isAsync || nextPreparedFlowieExecution.isAsync,
    allFunctionsNames: new Set([
      ...preparedFlowieExecution.allFunctionsNames,
      ...nextPreparedFlowieExecution.allFunctionsNames
    ]),
    flows: preparedFlowieExecution.flows.concat({ flows: nextPreparedFlowieExecution.flows })
  }
}

function addNextItemToFlowDeclaration (
  preparedFlowieExecution: PreparedFlowieExecution | null,
  flowDeclarationOrFunctionList: ReadonlyArray<DeclarationManagerOrFunctionDetails>
): PreparedFlowieExecution {
  const { isAsync, allFunctionsNames, flowElements } = flowDeclarationOrFunctionList.reduce(
    mergeFlowDeclarationAttributes, {
      isAsync: false,
      flowElements: [],
      allFunctionsNames: new Set<string>()
    } as FlowDeclarationAttributes
  )

  if (!preparedFlowieExecution) {
    return {
      isAsync: isAsync,
      allFunctionsNames: allFunctionsNames,
      flows: [createFlowElementFromElements(flowElements)]
    }
  }

  return {
    isAsync: preparedFlowieExecution.isAsync || isAsync,
    allFunctionsNames: new Set([...preparedFlowieExecution.allFunctionsNames, ...allFunctionsNames]),
    flows: preparedFlowieExecution.flows.concat(createFlowElementFromElements(flowElements))
  }
}

function mergeFlowDeclarationAttributes<Argument, Result> (
  flowDeclarationAttributes: FlowDeclarationAttributes,
  declarationManagerOrFunctionDetails: DeclarationManagerOrFunctionDetails
): FlowDeclarationAttributes {
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
  flowElements: ReadonlyArray<PreparedFlowie | FlowFunctionDetails>
): FlowElement {
  if (flowElements.length === 1) {
    const [firstFlowElement] = flowElements
    const preparedFlowie = (firstFlowElement as PreparedFlowie)
    if (preparedFlowie.flows) {
      return preparedFlowie
    }

    return {
      pipe: (firstFlowElement as FlowFunctionDetails).name
    }
  }

  return {
    split: flowElements.map(getNameOrFlowieDeclaration)
  }
}

function getFunctionNames (declarationManagerOrFunctionDetails: DeclarationManagerOrFunctionDetails) {
  const flowDeclaration = declarationManagerOrFunctionDetails as PreparedFlowieManager
  if (isFlowieExecutionDeclaration(flowDeclaration)) {
    return Array.from(flowDeclaration.allFunctionsNames)
  }

  const flowFunctionDetails = declarationManagerOrFunctionDetails as FlowFunctionDetails

  return [flowFunctionDetails.name]
}

function getFlowElement<Argument, Result> (
  declarationManagerOrFunctionDetails: DeclarationManagerOrFunctionDetails
): PreparedFlowie | FlowFunctionDetails {
  const flowDeclaration = declarationManagerOrFunctionDetails as PreparedFlowieManager
  if (isFlowieExecutionDeclaration(flowDeclaration)) {
    return { flows: flowDeclaration.flows, name: flowDeclaration.name }
  }

  return declarationManagerOrFunctionDetails as FlowFunctionDetails
}

function getNameOrFlowieDeclaration (flowElement: PreparedFlowie | FlowFunctionDetails): FlowieItemDeclaration {
  const preparedFlowie = flowElement as PreparedFlowie

  if (preparedFlowie.flows) {
    return preparedFlowie
  }

  return (flowElement as FlowFunctionDetails).name
}

type DeclarationManagerOrFunctionDetails = PreparedFlowieManager | FlowFunctionDetails

interface FlowDeclarationAttributes {
  readonly isAsync: boolean
  readonly allFunctionsNames: ReadonlySet<string>
  readonly flowElements: ReadonlyArray<PreparedFlowie | FlowFunctionDetails>
}
