import { mock } from 'sinon'

import { World } from '../FlowieTestsWorld'

import { createFlowieContainer, FlowieDeclaration, FlowResult, createFlowie, Flowie } from '../../../../src/index'
import { assertFlowIsNotRegistered, assertFlowIsRegistered, assertResults } from '../assertToAvoidMistakes'

export default interface ConfigurationFlowieWorld extends World {
  registerMockFunction<Argument, Result>(name: string, argument: Argument, result: Result): void
  createConfigurationFlow(flowName: string, flowDeclaration: FlowieDeclaration)
  executeConfiguredFlow(flowName: string, argument: string)
  getFlowResult<T = any>(flowName: string): FlowResult<T>
}

export function createConfigurationFlowieWorld (): ConfigurationFlowieWorld {
  let flowieContainer = createFlowieContainer()
  const flows: Record<string, Flowie<any, any>> = {}
  const flowResults: Record<string, FlowResult<any>> = {}

  return {
    name: 'ConfigurationFlowieWorld',
    registerMockFunction<Argument, Result> (functionName: string, argument: Argument, result: Result) {
      const functionCreated = mock().atLeast(1).withArgs(argument).returns(result).named(functionName)
      flowieContainer = flowieContainer.register([functionName, functionCreated])
    },
    createConfigurationFlow (flowName: string, flowDeclaration: FlowieDeclaration) {
      assertFlowIsNotRegistered(flowName, flows)
      flows[flowName] = createFlowie(flowieContainer, flowDeclaration)
    },
    executeConfiguredFlow (flowName: string, argument: string) {
      const flow = assertFlowIsRegistered(flowName, flows)
      flowResults[flowName] = flow(argument) as FlowResult<any>
    },
    getFlowResult<T = any> (flowName: string): FlowResult<T> {
      assertFlowIsRegistered(flowName, flows)
      return assertResults<T>(flowName, flowResults)
    }
  }
}
