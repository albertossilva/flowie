import { World } from '../FlowieTestsWorld'

import flowie, { createFlowieContainer, Flowie, FlowResult } from '../../../../src/index'
import {
  assertFlowIsNotRegistered,
  getRegisteredFlowFunctionDetails,
  assertFlowIsRegistered,
  assertResults
} from '../assertToAvoidMistakes'
import {
  createByPassMock,
  registerMockFunction,
  registerAsyncMockFunction,
  registerGeneratorMockFunction,
  registerGeneratorMockFunctionForObject
} from '../mockCreators'

export default interface RuntimeFlowieWorld extends World {
  createMockFunction<Argument, Result>(name: string, argument: Argument, result: Result): void
  createByPassMock(functionName: string): void
  createAsyncMockFunction<Argument, Result>(name: string, argument: Argument, result: Result): void
  createGeneratorMockFunction<T>(functionName: string, argument: string, yieldsList: ReadonlyArray<T>): void
  createGeneratorMockFunctionForObject<T>(functionName: string, keyYields: Record<string, ReadonlyArray<T>>): void
  createFlow(flowName: string, ...firstFunctionsNamesList: ReadonlyArray<string>): void
  pipeFunctionOnFlow(flowName: string, functionName: string): void
  splitFunctionOnFlow(flowName: string, functionNamesList: ReadonlyArray<string>): void
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
    createByPassMock (functionName: string) {
      flowieContainer = flowieContainer.register([functionName, createByPassMock(functionName)])
    },
    createAsyncMockFunction<Argument, Result> (functionName: string, argument: Argument, result: Result) {
      flowieContainer = registerAsyncMockFunction(flowieContainer, functionName, argument, result)
    },
    createGeneratorMockFunction<T> (functionName: string, argument: string, yieldsList: ReadonlyArray<T>) {
      flowieContainer = registerGeneratorMockFunction(flowieContainer, functionName, argument, yieldsList)
    },
    createGeneratorMockFunctionForObject<T> (functionName: string, keyYields: Record<string, ReadonlyArray<T>>) {
      flowieContainer = registerGeneratorMockFunctionForObject(flowieContainer, functionName, keyYields)
    },
    createFlow (flowName: string, ...firstFunctionsNamesList: ReadonlyArray<string>) {
      assertFlowIsNotRegistered(flowName, flows)
      const flowieItemsList = getRegisteredFlowFunctionDetails(firstFunctionsNamesList, flowieContainer)

      flows[flowName] = flowie(...flowieItemsList)
    },
    pipeFunctionOnFlow (flowName: string, functionName: string) {
      const flow = assertFlowIsRegistered(flowName, flows)
      const [flowItem] = getRegisteredFlowFunctionDetails([functionName.trim()], flowieContainer)
      flows[flowName] = flow.pipe(flowItem)
    },
    splitFunctionOnFlow (flowName: string, functionNamesList: ReadonlyArray<string>) {
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
