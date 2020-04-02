import { Flow } from './flowie.type'
import flowieResult, { FlowResult } from './optimizedFlowie/flowieResult'

import buildFlowieFromContainer from './buildFlowieFromContainer'
import { FlowieContainer } from './optimizedFlowie/container/createFlowieContainer'
import validateFlowieContainer from './validateFlowieContainer'

export default async function executeFlowieContainer<Type = any> (flowieContainer: FlowieContainer, flow: Flow, initialValue: any): Promise<FlowResult<Type>> {
  const error = validateFlowieContainer(flow, flowieContainer)
  if (error) {
    return flowieResult.fail(error)
  }

  const flowieFlow = buildFlowieFromContainer(flowieContainer, flow)

  return flowieFlow(initialValue)
}
