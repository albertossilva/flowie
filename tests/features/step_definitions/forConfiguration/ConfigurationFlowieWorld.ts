import { mock } from 'sinon'

import { World } from '../FlowieTestsWorld'

import { createFlowieContainer, FlowExecutionDeclaration } from '../../../../src/optimizedFlowie/index'

export default interface ConfigurationFlowieWorld extends World {
  registerMockFunction<Argument, Result>(name: string, argument: Argument, result: Result): void
  createConfigurationFlow(flowName: string, flowDeclaration: FlowExecutionDeclaration)
  // createFlow(flowName: string, firstFunctionName: string): void
  // pipeFunctionOnFlow(flowName: string, functionName: string)
  // executeFlow(flowName: string, firstParameter: any)
  // getFlowResult(flowName: string): FlowResult<any>
}

export function createConfigurationFlowieWorld (): ConfigurationFlowieWorld {
  let flowieContainer = createFlowieContainer()

  return {
    name: 'ConfigurationFlowieWorld',
    registerMockFunction<Argument, Result> (functionName: string, argument: Argument, result: Result) {
      const functionCreated = mock().atLeast(1).withArgs(argument).returns(result).named(functionName)
      flowieContainer = flowieContainer.register([functionName, functionCreated])
    },
    createConfigurationFlow (flowName: string, flowDeclaration: FlowExecutionDeclaration) {
      return null as any
    }
  }
}
