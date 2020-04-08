import { When } from 'cucumber'
import RuntimeFlowieWorld from './RuntimeFlowieWorld'

When(
  'I create a flow named {string} with {string}',
  function (this: RuntimeFlowieWorld, flowName: string, firstFunctionsNamesList: string) {
    this.createFlow(flowName, ...firstFunctionsNamesList.split(','))
  }
)

When(
  'I pipe to {string} on flow {string}',
  function (this: RuntimeFlowieWorld, functionName: string, flowName: string) {
    this.pipeFunctionOnFlow(flowName, functionName)
  }
)

When(
  'I split to {string} on flow {string}',
  function (this: RuntimeFlowieWorld, functionNamesList: string, flowName: string) {
    this.splitFunctionOnFlow(flowName, functionNamesList.split(','))
  }
)
