import { World } from '../FlowieTestsWorld'

import flowie, { createFlowieContainer, FlowieDeclaration, FlowResult, Flowie } from '../../../../src/index'
import { assertFlowIsNotRegistered, assertFlowIsRegistered, assertResults } from '../assertToAvoidMistakes'
import {
  createByPassMock,
  registerMockFunction,
  registerAsyncMockFunction,
  registerGeneratorMockFunction,
  registerGeneratorMockFunctionForObject
} from '../mockCreators'

export default interface ConfigurationFlowieWorld extends World {
  registerMockFunction<Argument, Result>(name: string, argument: Argument, result: Result): void
  registerByPassMock(functionName: string): void
  registerAsyncMockFunction(functionName: string, argument: any, result: string)
  registerGeneratorMockFunction<T>(functionName: string, argument: string, yieldsList: readonly T[]): void
  registerGeneratorMockFunctionForObject<T>(functionName: string, keyYields: Record<string, readonly T[]>): void
  createConfigurationFlow(flowName: string, flowDeclaration: FlowieDeclaration)
  executeConfiguredFlow(flowName: string, argument: string)
  getFlowResult<T = any>(flowName: string): FlowResult<T>
  getAsyncFlowResult<T = any>(flowName: string): Promise<FlowResult<T>>
}

export function createConfigurationFlowieWorld (): ConfigurationFlowieWorld {
  let flowieContainer = createFlowieContainer()
  const flows: Record<string, Flowie<any, any>> = {}
  const flowResults: Record<string, FlowResult<any> | Promise<FlowResult<any>>> = {}

  return {
    name: 'ConfigurationFlowieWorld',
    registerMockFunction<Argument, Result> (functionName: string, argument: Argument, result: Result) {
      flowieContainer = registerMockFunction(flowieContainer, functionName, argument, result)
    },
    registerByPassMock (functionName: string) {
      flowieContainer = flowieContainer.register([functionName, createByPassMock(functionName)])
    },
    registerAsyncMockFunction<Argument, Result> (functionName: string, argument: Argument, result: Result) {
      flowieContainer = registerAsyncMockFunction(flowieContainer, functionName, argument, result)
    },
    registerGeneratorMockFunction<T> (functionName: string, argument: string, yieldsList: readonly T[]) {
      flowieContainer = registerGeneratorMockFunction(flowieContainer, functionName, argument, yieldsList)
    },
    registerGeneratorMockFunctionForObject<T> (
      functionName: string,
      keyYields: Record<string, readonly T[]>
    ) {
      flowieContainer = registerGeneratorMockFunctionForObject(flowieContainer, functionName, keyYields)
    },
    createConfigurationFlow (flowName: string, flowDeclaration: FlowieDeclaration) {
      assertFlowIsNotRegistered(flowName, flows)
      flows[flowName] = flowie(flowieContainer, flowDeclaration)
    },
    executeConfiguredFlow (flowName: string, argument: string) {
      const flow = assertFlowIsRegistered(flowName, flows)
      flowResults[flowName] = flow(argument)
    },
    getFlowResult<T = any> (flowName: string) {
      assertFlowIsRegistered(flowName, flows)
      return assertResults<T>(flowName, flowResults) as FlowResult<any>
    },
    getAsyncFlowResult<T = any> (flowName: string) {
      assertFlowIsRegistered(flowName, flows)
      return assertResults<T>(flowName, flowResults) as Promise<FlowResult<T>>
    }
  }
}
