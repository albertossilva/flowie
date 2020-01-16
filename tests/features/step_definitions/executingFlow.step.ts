import { When } from 'cucumber'

import FlowieTestsWorld from './FlowieTestsWorld'

import { executeFlow } from '../../../src/flowieApi'

When('I execute the flow starting with {string}', async function (this: FlowieTestsWorld, startParameter: string, flowString: string) {
  this.flowieResult = await executeFlow(this.flowieContainer, JSON.parse(flowString), startParameter)
})
