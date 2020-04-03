import { FlowieDeclaration, PipeFlow, SplitFlow, FlowFunctionDetails } from '../types'
import createFlowDeclarationManager, { FlowDeclarationManager } from './createFlowDeclarationManager'

export default function buildFlowDeclaration (flowDeclaration: FlowieDeclaration): FlowDeclarationManager {
  const [firstFlow, ...restOfFlow] = flowDeclaration.flows
  const flowDeclarationManager = createFlowDeclarationManager(convertFlowToFlowFunctionDetails(firstFlow))

  return restOfFlow.reduce(parseFlows, flowDeclarationManager)
}

function parseFlows (flowDeclarationManager: FlowDeclarationManager, flow: PipeFlow | SplitFlow) {
  const flowFunctionDetailsList = convertFlowToFlowFunctionDetails(flow)
  if ((flow as PipeFlow).pipe) {
    const [flowFunctionDetails] = flowFunctionDetailsList
    return flowDeclarationManager.pipe(flowFunctionDetails)
  }

  return flowDeclarationManager.split(flowFunctionDetailsList)
}

function convertFlowToFlowFunctionDetails (flow: PipeFlow | SplitFlow): readonly FlowFunctionDetails[] {
  const pipeFlow = (flow as PipeFlow)
  if (pipeFlow.pipe) {
    return [{ name: pipeFlow.pipe.function }]
  }

  const splitFlow = (flow as SplitFlow)
  return splitFlow.split.functions.map(converToFlowFunctionDetails)
}

function converToFlowFunctionDetails (functionName: string): FlowFunctionDetails {
  return { name: functionName }
}
