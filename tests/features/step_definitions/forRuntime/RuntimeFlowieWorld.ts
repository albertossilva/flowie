import { World } from '../FlowieTestsWorld'

import flowie, { createFlowieContainer, Flowie, FlowResult } from '../../../../src/index'
import {
  assertFlowIsNotRegistered,
  getRegisteredFlowFunctionDetails,
  assertFlowIsRegistered,
  assertResults
} from '../assertToAvoidMistakes'
import { registerMockFunction, registerAsyncMockFunction } from '../mockCreators'

export default interface RuntimeFlowieWorld extends World {
  createMockFunction<Argument, Result>(name: string, argument: Argument, result: Result): void
  createAsyncMockFunction<Argument, Result>(name: string, argument: Argument, result: Result): void
  createFlow(flowName: string, ...firstFunctionsNamesList: readonly string[]): void
  pipeFunctionOnFlow(flowName: string, functionName: string): void
  splitFunctionOnFlow(flowName: string, functionNamesList: string[]): void
  executeFlow(flowName: string, firstParameter: any): void
  getFlowResult<T = any>(flowName: string): FlowResult<T>
  getAsyncFlowResult<T = any>(flowName: string): Promise<FlowResult<T>>
}

export function createRuntimeFlowieWorld (): RuntimeFlowieWorld {
  let flowieContainer = createFlowieContainer()
  const flows: Record<string, Flowie<any, any>> = {}
  const flowResults: Record<string, FlowResult<any> | Promise<FlowResult<any>>> = {}

  return {
    name: 'RuntimeFlowieWorld',
    createMockFunction<Argument, Result> (functionName: string, argument: Argument, result: Result) {
      flowieContainer = registerMockFunction(flowieContainer, functionName, argument, result)
    },
    createAsyncMockFunction<Argument, Result> (functionName: string, argument: Argument, result: Result) {
      flowieContainer = registerAsyncMockFunction(flowieContainer, functionName, argument, result)
    },
    createFlow (flowName: string, ...firstFunctionsNamesList: readonly string[]) {
      assertFlowIsNotRegistered(flowName, flows)
      const flowieItemsList = getRegisteredFlowFunctionDetails(firstFunctionsNamesList, flowieContainer)
      flows[flowName] = flowie(...flowieItemsList)
    },
    pipeFunctionOnFlow (flowName: string, functionName: string) {
      const flow = assertFlowIsRegistered(flowName, flows)
      const [flowItem] = getRegisteredFlowFunctionDetails([functionName.trim()], flowieContainer)
      flows[flowName] = flow.pipe(flowItem)
    },
    splitFunctionOnFlow (flowName: string, functionNamesList: string[]) {
      const flow = assertFlowIsRegistered(flowName, flows)
      const flowieItemsList = getRegisteredFlowFunctionDetails(functionNamesList, flowieContainer)
      flows[flowName] = flow.split(...flowieItemsList)
    },
    executeFlow (flowName: string, firstParameter: string) {
      const flow = assertFlowIsRegistered(flowName, flows)
      flowResults[flowName] = flow(firstParameter)
    },
    getFlowResult<FinalResult> (flowName: string) {
      assertFlowIsRegistered(flowName, flows)
      return assertResults<FinalResult>(flowName, flowResults) as FlowResult<FinalResult>
    },
    getAsyncFlowResult<FinalResult> (flowName: string) {
      assertFlowIsRegistered(flowName, flows)
      return assertResults<FinalResult>(flowName, flowResults) as Promise<FlowResult<FinalResult>>
    }
  }
}
