import { Seq } from 'immutable'

import { Flow, NoTypedFlowie, FlowFunction } from './flowie.type'
import { flowie } from './flowie'

import { FlowieContainer } from './optimizedFlowie/container/createFlowieContainer'

export default function buildFlowieFromContainer (flowieContainer: FlowieContainer, flow: Flow): NoTypedFlowie {
  if (flow.split) {
    return buildSplitFlow(flow.split, flowieContainer)
  }

  const [firstFlowItemName, ...otherFlowItemNames] = flow.pipe
  const firstFlowItem = flowieContainer.functionsContainer[firstFlowItemName]

  return buildPipeFlow(Seq.Indexed(otherFlowItemNames), flowieContainer, flowie(firstFlowItem))
}

function buildSplitFlow (splitFunctions: readonly string[], flowieContainer: FlowieContainer): NoTypedFlowie {
  const result = splitFunctions.map(getFunctionsFromContainer, flowieContainer)

  return flowie(...result)
}

function buildPipeFlow (flowItemsNameSequence: Seq.Indexed<string>, flowieContainer: FlowieContainer, flowieFlow: NoTypedFlowie): NoTypedFlowie {
  const flowieItemName = flowItemsNameSequence.first<string>()

  const nextFunctionToPipe = flowieContainer.functionsContainer[flowieItemName]

  const nextStepFlowieFlow = flowieFlow.pipe(nextFunctionToPipe)

  const nextFlowieItemsNameSequence = flowItemsNameSequence.rest()

  if (!nextFlowieItemsNameSequence.size) {
    return nextStepFlowieFlow
  }

  return buildPipeFlow(nextFlowieItemsNameSequence, flowieContainer, nextStepFlowieFlow)
}

function getFunctionsFromContainer (this: FlowieContainer, functionName: string): FlowFunction {
  return this.functionsContainer[functionName]
}
