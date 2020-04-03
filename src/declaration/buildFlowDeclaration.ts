import { FlowieDeclaration, PipeFlow } from '../types'
import createFlowDeclarationManager, { FlowDeclarationManager } from './createFlowDeclarationManager'

export default function buildFlowDeclaration (flowDeclaration: FlowieDeclaration): FlowDeclarationManager {
  const [firstFlow, ...restOfFlow] = flowDeclaration.flows as readonly PipeFlow[]
  const flowDeclarationManager = createFlowDeclarationManager([{ name: firstFlow.pipe.function }])

  return restOfFlow.reduce(pipeRestOfItem, flowDeclarationManager)
}

function pipeRestOfItem (flowDeclarationManager: FlowDeclarationManager, pipeFlow: PipeFlow) {
  return flowDeclarationManager.pipe({ name: pipeFlow.pipe.function })
}
