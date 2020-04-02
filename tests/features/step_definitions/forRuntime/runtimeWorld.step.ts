import { Before } from 'cucumber'

import FlowieTestsWorld from '../FlowieTestsWorld'
import { createRuntimeFlowieWorld } from './RuntimeFlowieWorld'

Before({ tags: '@runtime' }, function (this: FlowieTestsWorld) {
  this.setWorldConstructor(createRuntimeFlowieWorld)
})
