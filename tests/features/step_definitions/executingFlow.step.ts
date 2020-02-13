import { When } from 'cucumber'

import FlowieTestsWorld from './FlowieTestsWorld'

import { executeFlowieContainer } from '../../../src/flowieApi'

When(
  'I execute the flow starting with {string} as initial value',
  async function (this: FlowieTestsWorld, startParameter: string, flowString: string) {
    this.flowieResult = await executeFlowieContainer(this.flowieContainer, JSON.parse(flowString), startParameter)
  }
)
