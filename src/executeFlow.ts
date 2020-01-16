import Flow from './flow'
import flowie, { Flowie, FlowResult } from './flowie'
import { FlowieContainer } from './createFlowieContainer'

export default function executeFlow (flowieContainer: FlowieContainer, flow: Flow, initialValue: any): Promise<FlowResult<any>> {
  const [firstFlowItemName, ...otherFlowItemNames] = flow.pipe
  const firstFlowItem = flowieContainer.functionsContainer[firstFlowItemName]
  const flowieFlow = otherFlowItemNames
    .map(getFunctionsFromContainer, flowieContainer)
    .reduce<NoTypeFlowie>(buildPipeFlow, flowie(firstFlowItem as any))

  return flowieFlow.executeFlow(initialValue)
}

function getFunctionsFromContainer (this: FlowieContainer, functionName: string): Function {
  return this.functionsContainer[functionName]
}

function buildPipeFlow (flowie: NoTypeFlowie, nextFunctionToPipe: Function): NoTypeFlowie {
  return flowie.pipe(nextFunctionToPipe as any)
}

type NoTypeFlowie = Flowie<any, any>
