import { FlowFunctionDetails } from '../runtime.types'

import { PreparedFlowieExecution, FlowElement, PreparedFlowie, FlowieItemDeclaration } from '../prepared.types'

export default function createFlowDeclarationManager<Argument, Result> (
  flowDeclarationOrFunctionList: readonly DeclarationManagerOrFunctionDetails<Argument, Result>[],
  preparedFlowieExecution?: PreparedFlowieExecution
): PreparedFlowieManager {
  const flowDeclaration = addNextItemToFlowDeclaration(preparedFlowieExecution, flowDeclarationOrFunctionList)

  return createFlowieDeclarationManagerRuntime<Argument, Result>(flowDeclaration)
}

export interface PreparedFlowieManager extends PreparedFlowieExecution {
  readonly pipe: PipeDeclaration
  readonly split: (
    declarationManagerOrFunctionDetailsList: readonly (PreparedFlowieManager | FlowFunctionDetails)[]
  ) => PreparedFlowieManager
}

interface PipeDeclaration {
  (flowFunctionDetails: FlowFunctionDetails): PreparedFlowieManager
  (preparedFlowieExecution: PreparedFlowieExecution): PreparedFlowieManager
  (flowieExecutionDeclarationOrDetail: FlowFunctionDetails | PreparedFlowieExecution): PreparedFlowieManager
  (nextFlowieExecuteDeclaration: PreparedFlowieManager): PreparedFlowieManager
}

function createFlowieDeclarationManagerRuntime<Argument, Result> (
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
    split (declarationManagerOrFunctionDetailsList: readonly (PreparedFlowieManager | FlowFunctionDetails)[]) {
      return createFlowDeclarationManager(declarationManagerOrFunctionDetailsList, preparedFlowieExecution)
    }
  })
}

export function isFlowieExecutionDeclaration (preparedFlowieExecutionCandidate: PreparedFlowieExecution) {
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

function addNextItemToFlowDeclaration<Argument, Result> (
  preparedFlowieExecution: PreparedFlowieExecution | null,
  flowDeclarationOrFunctionList: readonly DeclarationManagerOrFunctionDetails<Argument, Result>[]
): PreparedFlowieExecution {
  const { isAsync, allFunctionsNames, flowElements } = flowDeclarationOrFunctionList.reduce(
    mergeFlowDeclarationAttributes, {
      isAsync: false,
      flowElements: [],
      allFunctionsNames: new Set<string>()
    } as FlowDeclarationAttributes<Argument, Result>
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
  flowElements: readonly (PreparedFlowie | FlowFunctionDetails)[]
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

function getFunctionNames (declarationManagerOrFunctionDetails: DeclarationManagerOrFunctionDetails<unknown, unknown>) {
  const flowDeclaration = declarationManagerOrFunctionDetails as PreparedFlowieManager
  if (isFlowieExecutionDeclaration(flowDeclaration)) {
    return Array.from(flowDeclaration.allFunctionsNames)
  }

  const flowFunctionDetails = declarationManagerOrFunctionDetails as FlowFunctionDetails

  return [flowFunctionDetails.name]
}

function getFlowElement<Argument, Result> (
  declarationManagerOrFunctionDetails: DeclarationManagerOrFunctionDetails<Argument, Result>
): PreparedFlowie | FlowFunctionDetails<Argument, Result> {
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

type DeclarationManagerOrFunctionDetails<Argument, Result> = PreparedFlowieManager
  | FlowFunctionDetails<Argument, Result>

interface FlowDeclarationAttributes<Argument, Result> {
  readonly isAsync: boolean
  readonly allFunctionsNames: ReadonlySet<string>
  readonly flowElements: readonly (PreparedFlowie | FlowFunctionDetails<Argument, Result>)[]
}
