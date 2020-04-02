import { expect } from 'chai'
import { stub } from 'sinon'

import createFlowieContainer from '../createFlowieContainer'

describe('container/createFlowieContainer', function () {
  before(function () {
    this.foo = stub().named('foo')
    this.bar = stub().named('bar')
    this.foobar = stub().named('foobar')
    this.container = createFlowieContainer()
      .register(this.foo)
      .register(this.bar)
      .register(['aliasFoo', this.foo])
      .register(this.foobar, ['aliasFoobar', this.foobar])
  })

  it('has foo as a registered function', function () {
    expect(this.container.functionsContainer.foo.flowItem).equal(this.foo)
  })

  it('has bar as a registered function', function () {
    expect(this.container.functionsContainer.bar.flowItem).equal(this.bar)
  })

  it('has aliasFoo as equals to foo', function () {
    expect(this.container.functionsContainer.aliasFoo.flowItem).equal(this.foo)
  })

  it('has aliasFoobar as equals to foo', function () {
    expect(this.container.functionsContainer.aliasFoobar.flowItem).equal(this.foobar)
  })

  it('includes the function name on all names', function () {
    expect(this.container.allFunctionsNames.toJS()).to.deep.equal(['foo', 'bar', 'aliasFoo', 'foobar', 'aliasFoobar'])
  })
})
