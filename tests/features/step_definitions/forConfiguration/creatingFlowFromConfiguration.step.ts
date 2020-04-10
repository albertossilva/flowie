import { When } from 'cucumber'
import ConfigurationFlowieWorld from './ConfigurationFlowieWorld'
import { PreparedFlowie } from '../../../../src'

When(
  'I create a flow from configuration named {string} with value',
  function (this: ConfigurationFlowieWorld, flowName: string, preparedFlowieString: string) {
    const preparedFlowie = JSON.parse(preparedFlowieString) as PreparedFlowie
    this.createConfigurationFlow(flowName, preparedFlowie)
  }
)
