import Flow from './flow'
import flowie, { Flowie, FlowResult } from './flowie'
import { FlowieContainer } from './createFlowieContainer'
import { Seq, Set } from 'immutable'

function validate (flow: Flow, flowieContainer: FlowieContainer): FlowResult<any> | undefined {
  const functionNames = (flow.pipe || []).concat(flow.split || [])
  const notRegisteredFunctions = Set(functionNames.filter(findNotRegisteredFunctions, flowieContainer))

  if (notRegisteredFunctions.size) {
    return {
      success: false,
      error: new TypeError(`There is no functions registered on the container with this names: ${notRegisteredFunctions.join(', ')}`),
      result: null,
      executionTime: 0,
      functions: {}
    }
  }
  return undefined
}

export default async function executeFlowieContainer<Type = any> (flowieContainer: FlowieContainer, flow: Flow, initialValue: any): Promise<FlowResult<Type>> {
  const validation = validate(flow, flowieContainer)
  if (validation) {
    return validation
  }

  const flowieFlow = buildFlowie(flowieContainer, flow)

  return flowieFlow.executeFlow<Type>(initialValue)
}

function buildFlowie (flowieContainer: FlowieContainer, flow: Flow): NoTypedFlowie {
  if (flow.split) {
    return buildSplitFlow(flow.split as readonly string[], flowieContainer)
  }

  const [firstFlowItemName, ...otherFlowItemNames] = flow.pipe
  const firstFlowItem = flowieContainer.functionsContainer[firstFlowItemName]

  return buildPipeFlow(Seq.Indexed(otherFlowItemNames), flowieContainer, flowie(firstFlowItem as any))
}

function findNotRegisteredFunctions (this: FlowieContainer, functionName: string): boolean {
  return !(functionName in this.functionsContainer)
}

function buildSplitFlow (splitFunctions: readonly string[], flowieContainer: FlowieContainer): any {
  const result = splitFunctions.map(getFunctionsFromContainer, flowieContainer)

  return flowie(...result as any)
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

function getFunctionsFromContainer (this: FlowieContainer, functionName: string): Function {
  return this.functionsContainer[functionName]
}
