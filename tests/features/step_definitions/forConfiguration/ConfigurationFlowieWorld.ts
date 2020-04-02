import { mock } from 'sinon'

import { World } from '../FlowieTestsWorld'

import { createFlowieContainer, FlowieDeclaration, FlowResult, createFlowie, Flowie } from '../../../../src/index'
import { assertFlowIsNotRegistered, assertFlowIsRegistered } from '../assertToAvoidMistakes'

export default interface ConfigurationFlowieWorld extends World {
  registerMockFunction<Argument, Result>(name: string, argument: Argument, result: Result): void
  createConfigurationFlow(flowName: string, flowDeclaration: FlowieDeclaration)
  executeConfiguredFlow(flowName: string, argument: string)
  // createFlow(flowName: string, firstFunctionName: string): void
  // pipeFunctionOnFlow(flowName: string, functionName: string)
  // executeFlow(flowName: string, firstParameter: any)
  // getFlowResult(flowName: string): FlowResult<any>
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
    }
  }
}
