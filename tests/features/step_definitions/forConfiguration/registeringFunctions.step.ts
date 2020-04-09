import { assert } from 'chai'
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

Given(
  'an async registered function called {string} that receives {string} and resolves {string}',
  function (this: ConfigurationFlowieWorld, functionName: string, argument: string, result: string) {
    this.registerAsyncMockFunction(functionName, argument, result)
  }
)

Given(
  'a registered generator function called {string} that receives {string} and yields:',
  function (this: ConfigurationFlowieWorld, functionName: string, argument: string, yieldsJSON: string) {
    const yieldsList = JSON.parse(yieldsJSON)
    assert.isArray(yieldsList, 'This step just accepts arrays for yield')

    this.registerGeneratorMockFunction(functionName, argument, yieldsList)
  }
)

Given(
  'a registered generator function called {string} that receives the keys and return the values',
  function (this: ConfigurationFlowieWorld, functionName: string, keyYieldsJSON: string) {
    const keyYields = JSON.parse(keyYieldsJSON)
    const stepWarning = 'This step requires a object where keys are parameters and values are yields'
    assert.isObject(keyYields, stepWarning)
    assert.isTrue(Object.values(keyYields).every(Array.isArray), `All the keys should be an array. ${stepWarning}`)

    this.registerGeneratorMockFunctionForObject(functionName, keyYields)
  }
)

Given('a registered bypass function called {string}', function (this: ConfigurationFlowieWorld, functionName: string) {
  this.registerByPassMock(functionName)
})
