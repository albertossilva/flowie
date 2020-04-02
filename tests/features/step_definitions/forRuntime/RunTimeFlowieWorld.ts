import { mock } from 'sinon'

import { World } from '../FlowieTestsWorld'

import { createFlowieContainer, Flowie, createFlowie, FlowResult } from '../../../../src/index'
import { assertFlowIsNotRegistered, assertFunctionIsRegistered, assertFlowIsRegistered } from '../assertToAvoidMistakes'

export default interface RuntimeFlowieWorld extends World {
  createMockFunction<Argument, Result>(name: string, argument: Argument, result: Result): void
  createFlow(flowName: string, firstFunctionName: string): void
  pipeFunctionOnFlow(flowName: string, functionName: string)
  executeFlow(flowName: string, firstParameter: any)
  getFlowResult(flowName: string): FlowResult<any>
}

export function createRuntimeFlowieWorld (): RuntimeFlowieWorld {
  let flowieContainer = createFlowieContainer()
  const flows: Record<string, Flowie<any, any>> = {}
  const flowResults: Record<string, FlowResult<any>> = {}

  return {
    name: 'RuntimeFlowieWorld',
    createMockFunction<Argument, Result> (functionName: string, argument: Argument, result: Result) {
      const functionCreated = mock().atLeast(1).withArgs(argument).returns(result).named(functionName)
      flowieContainer = flowieContainer.register([functionName, functionCreated])
    },
    createFlow (flowName: string, firstFunctionName: string) {
      assertFlowIsNotRegistered(flowName, flows)
      const flowFunction = assertFunctionIsRegistered(firstFunctionName, flowieContainer)
      flows[flowName] = createFlowie(flowFunction.flowItem)
    },
    pipeFunctionOnFlow (flowName: string, functionName: string) {
      const flow = assertFlowIsRegistered(flowName, flows)
      const flowFunction = assertFunctionIsRegistered(functionName, flowieContainer)
      flows[flowName] = flow.pipe(flowFunction.flowItem)
    },
    executeFlow<FinalResult> (flowName: string, firstParameter: string) {
      const flow = assertFlowIsRegistered(flowName, flows)
      flowResults[flowName] = flow(firstParameter) as FlowResult<FinalResult>
    },
    getFlowResult (flowName: string) {
      assertFlowIsRegistered(flowName, flows)
      return flowResults[flowName]
    }
  }
}
