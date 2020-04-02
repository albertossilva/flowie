import { When } from 'cucumber'
import ConfigurationFlowieWorld from './ConfigurationFlowieWorld'
import { FlowieDeclaration } from '../../../../src'

When(
  'I create a flow from configuration named {string} with value',
  function (this: ConfigurationFlowieWorld, flowName: string, flowDeclarationString: string) {
    const flowDeclaration = JSON.parse(flowDeclarationString) as FlowieDeclaration
    this.createConfigurationFlow(flowName, flowDeclaration)
  }
)
