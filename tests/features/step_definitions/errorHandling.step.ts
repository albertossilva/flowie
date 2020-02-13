import { Then } from 'cucumber'
import { expect } from 'chai'

import FlowieTestsWorld from './FlowieTestsWorld'

Then('The error field on execute should includes {string}', async function (this: FlowieTestsWorld, includeOnMessage: string) {
  expect(this.flowieResult.success).to.false
  expect(this.flowieResult.error.message).to.includes(includeOnMessage)
})
