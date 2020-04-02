import { When } from 'cucumber'
import RuntimeFlowieWorld from './RuntimeFlowieWorld'

When(
  'I create a flow named {string} with {string}',
  function (this: RuntimeFlowieWorld, flowName: string, firstFunctionName: string) {
    this.createFlow(flowName, firstFunctionName)
  }
)

When(
  'I pipe to {string} on flow {string}',
  function (this: RuntimeFlowieWorld, functionName: string, flowName: string) {
    this.pipeFunctionOnFlow(flowName, functionName)
  }
)
