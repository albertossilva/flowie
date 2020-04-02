import { assert } from 'chai'
import { mock } from 'sinon'

import { World } from '../FlowieTestsWorld'

import { createFlowieContainer, Flowie, createFlowie, FlowResult } from '../../../../src/index'

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

  function assertFlowIsNotRegistered (flowName: string) {
    const flowNamesList = Object.keys(flowName)
    assert.ok(
      !flowNamesList.includes(flowName),
      `A flow is already register with name ${flowName}, list of flows: ${flowNamesList.join(', ')}`
    )
  }

  function assertFlowName (flowName: string) {
    const flowNamesList = Object.keys(flowName)

    assert.ok(
      flowName,
      `No flow with name ${flowName} is registered, see the list ${flowNamesList.join(', ')}`
    )

    return flows[flowName]
  }

  function assertFunctionName (functionName: string) {
    const possibleFunction = flowieContainer.functionsContainer[functionName]

    assert.ok(
      possibleFunction,
      `No function with name ${functionName} is registered, see the list ${flowieContainer.allFunctionsNames}`
    )

    return possibleFunction
  }

  return {
    name: 'RuntimeFlowieWorld',
    createMockFunction<Argument, Result> (functionName: string, argument: Argument, result: Result) {
      const functionCreated = mock().atLeast(1).withArgs(argument).returns(result).named(functionName)
      flowieContainer = flowieContainer.register([functionName, functionCreated])
    },
    createFlow (flowName: string, firstFunctionName: string) {
      assertFlowIsNotRegistered(flowName)
      const flowFunction = assertFunctionName(firstFunctionName)
      flows[flowName] = createFlowie(flowFunction.flowItem)
    },
    pipeFunctionOnFlow (flowName: string, functionName: string) {
      const flow = assertFlowName(flowName)
      const flowFunction = assertFunctionName(functionName)
      flows[flowName] = flow.pipe(flowFunction.flowItem)
    },
    executeFlow<FinalResult> (flowName: string, firstParameter: string) {
      const flow = assertFlowName(flowName)
      flowResults[flowName] = flow(firstParameter) as FlowResult<FinalResult>
    },
    getFlowResult (flowName: string) {
      assertFlowName(flowName)
      return flowResults[flowName]
    }
  }
}
