import { Given } from 'cucumber'
import ConfigurationFlowieWorld from './ConfigurationFlowieWorld'

Given(
  'a registered function called {string} that receives {string} and returns {string}',
  function (this: ConfigurationFlowieWorld, functionName: string, argument: string, result: string) {
    this.registerMockFunction(functionName, argument, result)
  }
)

Given(
  'a registered function called {string} that returns {string} receiving',
  function (this: ConfigurationFlowieWorld, functionName: string, result: string, argumentJSON: string) {
    const argument = JSON.parse(argumentJSON)
    this.registerMockFunction(functionName, argument, result)
  }
)
