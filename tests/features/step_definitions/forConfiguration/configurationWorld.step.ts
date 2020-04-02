import { Before } from 'cucumber'

import FlowieTestsWorld from '../FlowieTestsWorld'
import { createConfigurationFlowieWorld } from './ConfigurationFlowieWorld'

Before({ tags: '@configuration' }, function (this: FlowieTestsWorld) {
  this.setWorldConstructor(createConfigurationFlowieWorld)
})
