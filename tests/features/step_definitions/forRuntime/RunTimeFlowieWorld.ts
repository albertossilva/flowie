import { mock, SinonExpectation } from 'sinon'

import { World } from '../FlowieTestsWorld'

import { createFlowieContainer, Flowie, createFlowie, FlowResult } from '../../../../src/index'
import {
  assertFlowIsNotRegistered,
  getRegisteredFlowFunctionDetails,
  assertFlowIsRegistered,
  assertResults
} from '../assertToAvoidMistakes'

export default interface RuntimeFlowieWorld extends World {
  createMockFunction<Argument, Result>(name: string, argument: Argument, result: Result): void
  createFlow(flowName: string, ...firstFunctionsNamesList: readonly string[]): void
  pipeFunctionOnFlow(flowName: string, functionName: string): void
  splitFunctionOnFlow(flowName: string, functionNamesList: string[]): void
  executeFlow(flowName: string, firstParameter: any): void
  getFlowResult<T = any>(flowName: string): FlowResult<T>
}

export function createRuntimeFlowieWorld (): RuntimeFlowieWorld {
  let flowieContainer = createFlowieContainer()
  const flows: Record<string, Flowie<any, any>> = {}
  const flowResults: Record<string, FlowResult<any>> = {}

  return {
    name: 'RuntimeFlowieWorld',
    createMockFunction<Argument, Result> (functionName: string, argument: Argument, result: Result) {
      const mockFunction = (mock(functionName) as any as SinonExpectation)
      const functionCreated = mockFunction.atLeast(1).withArgs(argument).returns(result).named(functionName)
      flowieContainer = flowieContainer.register([functionName, functionCreated])
    },
    createFlow (flowName: string, ...firstFunctionsNamesList: readonly string[]) {
      assertFlowIsNotRegistered(flowName, flows)
      const flowieItemsList = getRegisteredFlowFunctionDetails(firstFunctionsNamesList, flowieContainer)
      flows[flowName] = createFlowie(...flowieItemsList)
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
    executeFlow<FinalResult> (flowName: string, firstParameter: string) {
      const flow = assertFlowIsRegistered(flowName, flows)
      flowResults[flowName] = flow(firstParameter) as FlowResult<FinalResult>
    },
    getFlowResult<T> (flowName: string) {
      assertFlowIsRegistered(flowName, flows)
      return assertResults<T>(flowName, flowResults)
    }
  }
}
