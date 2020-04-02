import { Given } from 'cucumber'
import ConfigurationFlowieWorld from './ConfigurationFlowieWorld'

Given(
  'a registered function called {string} that receives {string} and returns {string}',
  function (this: ConfigurationFlowieWorld, functionName: string, parameter: string, result: string) {
    this.registerMockFunction(functionName, parameter, result)
  }
)
