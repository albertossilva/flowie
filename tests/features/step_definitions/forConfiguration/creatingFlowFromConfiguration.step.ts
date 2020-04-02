import { When } from 'cucumber'
import ConfigurationFlowieWorld from './ConfigurationFlowieWorld'
import { FlowExecutionDeclaration } from '../../../../src/optimizedFlowie'

When(
  'I create a flow from configuration named {string} with value',
  function (this: ConfigurationFlowieWorld, flowName: string, flowDeclarationString: string) {
    const flowDeclaration = JSON.parse(flowDeclarationString) as FlowExecutionDeclaration
    this.createConfigurationFlow(flowName, flowDeclaration)
  }
)
