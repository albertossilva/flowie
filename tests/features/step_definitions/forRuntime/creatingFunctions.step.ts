import { Given } from 'cucumber'
import RuntimeFlowieWorld from './RuntimeFlowieWorld'

Given(
  'a function called {string} that receives {string} and returns {string}',
  function (this: RuntimeFlowieWorld, functionName: string, parameter: string, result: string) {
    this.createMockFunction(functionName, parameter, result)
  }
)
