import { FlowieContainer } from '../container/createFlowieContainer'

import { FlowieDeclaration, PipeFlow, SplitFlow, FlowFunctionDetails } from '../types'

import createFlowDeclarationManager, { FlowDeclarationManager } from './createFlowDeclarationManager'

export default function buildFlowDeclaration (
  flowDeclaration: FlowieDeclaration,
  flowieContainer: FlowieContainer
): FlowDeclarationManager {
  const [firstFlow, ...restOfFlow] = flowDeclaration.flows
  const flowFunctionDetails = convertFlowToFlowFunctionDetails(firstFlow, flowieContainer)
  const flowDeclarationManager = createFlowDeclarationManager(flowFunctionDetails)

  return restOfFlow.reduce(parseFlows, { flowDeclarationManager, flowieContainer }).flowDeclarationManager
}

function parseFlows (
  { flowDeclarationManager, flowieContainer }: {
    readonly flowDeclarationManager: FlowDeclarationManager,
    readonly flowieContainer: FlowieContainer
  },
  flow: PipeFlow | SplitFlow
) {
  const flowFunctionDetailsList = convertFlowToFlowFunctionDetails(flow, flowieContainer)
  if ((flow as PipeFlow).pipe) {
    const [flowFunctionDetails] = flowFunctionDetailsList
    return {
      flowieContainer,
      flowDeclarationManager: flowDeclarationManager.pipe(flowFunctionDetails)
    }
  }

  return {
    flowieContainer,
    flowDeclarationManager: flowDeclarationManager.split(flowFunctionDetailsList)
  }
}

function convertFlowToFlowFunctionDetails (
  flow: PipeFlow | SplitFlow,
  flowieContainer: FlowieContainer
): readonly FlowFunctionDetails[] {
  const pipeFlow = (flow as PipeFlow)
  if (pipeFlow.pipe) {
    return [{
      name: pipeFlow.pipe.function,
      isAsync: flowieContainer.functionsContainer[pipeFlow.pipe.function].isAsync
    }]
  }

  const splitFlow = (flow as SplitFlow)
  return splitFlow.split.functions.map(converSplitToFlowFunctionDetails, { flowieContainer })
}

function converSplitToFlowFunctionDetails (this: { readonly flowieContainer: FlowieContainer }, functionName: string) {
  return converToFlowFunctionDetails(functionName, this.flowieContainer)
}

function converToFlowFunctionDetails (functionName: string, flowieContainer: FlowieContainer): FlowFunctionDetails {
  return {
    name: functionName,
    isAsync: flowieContainer.functionsContainer[functionName].isAsync
  }
}
