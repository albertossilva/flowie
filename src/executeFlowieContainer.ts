import Flow from './flow'
import flowie, { Flowie, FlowResult } from './flowie'
import { FlowieContainer } from './createFlowieContainer'
import { Seq, Set } from 'immutable'

export default async function executeFlowieContainer<Type = any> (flowieContainer: FlowieContainer, flow: Flow, initialValue: any): Promise<FlowResult<Type>> {
  const notRegisteredFunctions = Set(flow.pipe.filter(findNotRegisteredFunctions, flowieContainer))

  if (notRegisteredFunctions.size) {
    return {
      success: false,
      error: new TypeError(`There is no functions registered on the container with this names: ${notRegisteredFunctions.join(', ')}`),
      result: null,
      executionTime: 0,
      functions: {}
    }
  }

  const [firstFlowItemName, ...otherFlowItemNames] = flow.pipe
  const firstFlowItem = flowieContainer.functionsContainer[firstFlowItemName]

  const flowieFlow = buildPipeFlow(Seq.Indexed(otherFlowItemNames), flowieContainer, flowie(firstFlowItem as any))
  return flowieFlow.executeFlow<Type>(initialValue)
}

function findNotRegisteredFunctions (this: FlowieContainer, functionName: string): boolean {
  return !(functionName in this.functionsContainer)
}

function buildPipeFlow (flowItemsNameSequence: Seq.Indexed<string>, flowieContainer: FlowieContainer, flowieFlow: NoTypedFlowie): NoTypedFlowie {
  const flowieItemName = flowItemsNameSequence.first() as string
  const nextFunctionToPipe: Function = flowieContainer.functionsContainer[flowieItemName]

  const nextStepFlowieFlow = flowieFlow.pipe(nextFunctionToPipe as any)

  const nextFlowieItemsNameSequence = flowItemsNameSequence.rest()

  if (!nextFlowieItemsNameSequence.size) {
    return nextStepFlowieFlow
  }

  return buildPipeFlow(nextFlowieItemsNameSequence, flowieContainer, nextStepFlowieFlow)
}

type NoTypedFlowie = Flowie<any, any>
