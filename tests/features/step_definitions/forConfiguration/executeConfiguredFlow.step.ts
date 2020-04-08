import { When } from 'cucumber'
import ConfigurationFlowieWorld from './ConfigurationFlowieWorld'

When(
  'I execute the flow from configuration {string} with {string}',
  function (this: ConfigurationFlowieWorld, flowName: string, argument: string) {
    this.executeConfiguredFlow(flowName, argument)
  }
)
