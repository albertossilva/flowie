import { Given } from 'cucumber'
import RuntimeFlowieWorld from './RuntimeFlowieWorld'

Given(
  'a function called {string} that receives {string} and returns {string}',
  function (this: RuntimeFlowieWorld, functionName: string, argument: string, result: string) {
    this.createMockFunction(functionName, argument, result)
  }
)

Given(
  'a function called {string} that returns {string} receiving',
  function (this: RuntimeFlowieWorld, functionName: string, result: string, argumentJSON: string) {
    const argument = JSON.parse(argumentJSON)
    this.createMockFunction(functionName, argument, result)
  }
)

Given(
  'an async function called {string} that receives {string} and resolves with {string}',
  function (this: RuntimeFlowieWorld, functionName: string, argument: string, result: string) {
    this.createAsyncMockFunction(functionName, argument, result)
  }
)
