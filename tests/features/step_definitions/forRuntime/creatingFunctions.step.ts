import { assert } from 'chai'
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

Given(
  'a generator function called {string} that receives {string} and yields:',
  function (this: RuntimeFlowieWorld, functionName: string, argument: string, yieldsJSON: string) {
    const yieldsList = JSON.parse(yieldsJSON)
    assert.isArray(yieldsList, 'This step just accepts arrays for yield')

    this.createGeneratorMockFunction(functionName, argument, yieldsList)
  }
)

Given(
  'a generator function called {string} that receives the keys and return the values',
  function (this: RuntimeFlowieWorld, functionName: string, keyYieldsJSON: string) {
    const keyYields = JSON.parse(keyYieldsJSON)
    const stepWarning = 'This step requires a object where keys are parameters and values are yields'
    assert.isObject(keyYields, stepWarning)
    assert.isTrue(Object.values(keyYields).every(Array.isArray), `All the keys should be an array. ${stepWarning}`)

    this.createGeneratorMockFunctionForObject(functionName, keyYields)
  }
)

Given('a bypass function called {string}', function (this: RuntimeFlowieWorld, functionName: string) {
  this.createByPassMock(functionName)
})
