import { expect } from 'chai'
import { stub } from 'sinon'

import createFlowieContainer, { isFlowieContainer, FlowieContainer } from '../createFlowieContainer'

describe('container/createFlowieContainer', function () {
  before(function () {
    this.foo = stub().named('foo')
    this.bar = stub().named('bar')
    this.foobar = stub().named('foobar')
    this.container = createFlowieContainer()
      .register(this.foo, this.bar)
      .register(['aliasFoo', this.foo])
      .register(this.foobar, ['aliasFoobar', this.foobar])
      .register(generateAnonymousFunction())
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
    expect(this.container.allFunctionsNames.butLast().toJS()).to.deep.equal(
      ['foo', 'bar', 'aliasFoo', 'foobar', 'aliasFoobar']
    )
  })

  it('generates a name for anonymous function', function () {
    expect(this.container.allFunctionsNames.last()).to.match(/^anoymous[a-z0-9]{10,11}$/)
  })

  it('returns true for the container when checking isFlowieContainer', function () {
    expect(isFlowieContainer(this.container)).to.true
  })

  it('returns false for things that are not created by createFlowieContainer', function () {
    expect(isFlowieContainer({} as any as FlowieContainer)).to.false
    expect(isFlowieContainer(this.foo as FlowieContainer)).to.false
    expect(isFlowieContainer(undefined as FlowieContainer)).to.false
  })
})

/* istanbul ignore next */
const generateAnonymousFunction = () => () => ''
