import { When } from 'cucumber'
import RuntimeFlowieWorld from './RuntimeFlowieWorld'

When(
  'I execute the flow {string} with {string}',
  async function (this: RuntimeFlowieWorld, flowName: string, firstParameter: string) {
    await this.executeFlow(flowName, firstParameter)
  }
)
