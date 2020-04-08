import { World } from '../FlowieTestsWorld'

import flowie, { createFlowieContainer, FlowieDeclaration, FlowResult, Flowie } from '../../../../src/index'
import { assertFlowIsNotRegistered, assertFlowIsRegistered, assertResults } from '../assertToAvoidMistakes'
import { registerMockFunction, registerAsyncMockFunction } from '../mockCreators'

export default interface ConfigurationFlowieWorld extends World {
  registerMockFunction<Argument, Result>(name: string, argument: Argument, result: Result): void
  registerAsyncMockFunction(functionName: string, argument: any, result: string)
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
    registerAsyncMockFunction<Argument, Result> (functionName: string, argument: Argument, result: Result) {
      flowieContainer = registerAsyncMockFunction(flowieContainer, functionName, argument, result)
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
