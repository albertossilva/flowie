import { FlowieContainer } from '../container/createFlowieContainer'

import {
  FlowieDeclaration,
  PipeFlow,
  SplitFlow,
  FlowFunctionDetails,
  FlowElement,
  FlowieItemDeclaration
} from '../types'

import createFlowDeclarationManager, { FlowDeclarationManager } from './createFlowDeclarationManager'

export default function buildFlowDeclaration (
  flowDeclaration: FlowieDeclaration,
  flowieContainer: FlowieContainer
): FlowDeclarationManager {
  const [firstFlow, ...restOfFlow] = flowDeclaration.flows

  const flowFunctionDetails = convertFlowElementToDeclarable(firstFlow, flowieContainer)
  const flowDeclarationManager = createFlowDeclarationManager(flowFunctionDetails)

  return restOfFlow.reduce(parseFlows, { flowDeclarationManager, flowieContainer }).flowDeclarationManager
}

function parseFlows (
  { flowDeclarationManager, flowieContainer }: {
    readonly flowDeclarationManager: FlowDeclarationManager,
    readonly flowieContainer: FlowieContainer
  },
  flowElement: FlowElement
) {
  const flowFunctionDetailsList = convertFlowElementToDeclarable(flowElement, flowieContainer)
  if ((flowElement as SplitFlow).split) {
    return {
      flowieContainer,
      flowDeclarationManager: flowDeclarationManager.split(flowFunctionDetailsList)
    }
  }

  const [flowFunctionDetails] = flowFunctionDetailsList
  return {
    flowieContainer,
    flowDeclarationManager: flowDeclarationManager.pipe(flowFunctionDetails)
  }
}

function convertFlowElementToDeclarable (
  flowElement: FlowElement,
  flowieContainer: FlowieContainer
): readonly (FlowFunctionDetails | FlowDeclarationManager)[] {
  const pipeFlow = (flowElement as PipeFlow)
  if (pipeFlow.pipe) {
    if (typeof pipeFlow.pipe === 'string') {
      return [converToFlowFunctionDetails(pipeFlow.pipe, flowieContainer)]
    }

    return [
      buildFlowDeclaration(
        { flows: [pipeFlow.pipe], name: pipeFlow.name },
        flowieContainer
      )
    ]
  }

  const splitFlow = (flowElement as SplitFlow)
  if (splitFlow.split) {
    const splitFlow = (flowElement as SplitFlow)
    return splitFlow.split.map(converSplitToFlowFunctionDetails, { flowieContainer })
  }

  return [buildFlowDeclaration(flowElement as FlowieDeclaration, flowieContainer)]
}

function converSplitToFlowFunctionDetails (
  this: { readonly flowieContainer: FlowieContainer },
  flowieItemDeclaration: FlowieItemDeclaration
) {
  if (typeof flowieItemDeclaration === 'string') {
    return converToFlowFunctionDetails(flowieItemDeclaration, this.flowieContainer)
  }

  return buildFlowDeclaration(
    { flows: [flowieItemDeclaration], name: flowieItemDeclaration.name },
    this.flowieContainer
  )
}

function converToFlowFunctionDetails (functionName: string, flowieContainer: FlowieContainer): FlowFunctionDetails {
  const { isAsync, isGenerator } = flowieContainer.functionsContainer[functionName]
  return {
    name: functionName,
    isAsync,
    isGenerator
  }
}
