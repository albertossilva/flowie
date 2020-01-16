import { Before, Given } from 'cucumber'
import { mock } from 'sinon'

import FlowieTestsWorld from './FlowieTestsWorld'
import { createFlowieContainer } from '../../../src/flowieApi'

Before(function (this: FlowieTestsWorld) {
  this.flowieContainer = createFlowieContainer()
})

Given(
  'a registered function called {string} that takes {int} millisecond\\(s)',
  function (this: FlowieTestsWorld, functionName: string, delay: number) {
    this.flowieContainer = this.flowieContainer.register(functionName, generateTimeoutFunction(functionName, delay))
  }
)

Given(
  'a registered function called {string} that receives {string} and return {string}',
  function (this: FlowieTestsWorld, functionName: string, input: string, output: string) {
    this.flowieContainer = this.flowieContainer.register(functionName, generateWithInputAndOutputFunction(functionName, input, output))
  }
)

function generateWithInputAndOutputFunction (functionName: string, input: string, output: string): Function {
  return mock()
    .named(functionName)
    .withArgs(input)
    .resolves(output)
}

function generateTimeoutFunction (functionName: string, delay: number): Function {
  return mock()
    .named(functionName)
    .callsFake(() => new Promise((resolve: Function) => {
      setTimeout(() => resolve(), delay)
    }))
}
