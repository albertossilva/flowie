import { expect } from 'chai'
import { stub } from 'sinon'

import createFlowieContainer, { isFlowieContainer, FlowieContainer } from '../createFlowieContainer'

describe('container/createFlowieContainer', function () {
  before(function () {
    this.foo = stub().named('foo')
    this.bar = stub().named('bar')
    this.foobar = stub().named('foobar')
    this.otherFunction = stub().named('otherFunction')
    this.oneMoreFunction = stub().named('oneMoreFunction')
    this.oneMoreFunction[Symbol.toStringTag] = 'AsyncFunction'
    this.anonymousFunction = generateAnonymousFunction()

    const otherContainer = createFlowieContainer().register(this.foo, this.bar)
    const oneMoreContainer = createFlowieContainer().register(this.oneMoreFunction)

    this.container = createFlowieContainer()
      .register(this.foo)
      .register(this.foo, this.bar)
      .register(['aliasFoo', this.foo])
      .merge(this.otherFunction, oneMoreContainer, { just: 'skipped' } as any)
      .merge(otherContainer)
      .register(this.foobar, ['aliasFoobar', this.foobar])
      .register(this.anonymousFunction)
      .register(this.anonymousFunction, this.anonymousFunction)
  })

  it('has foo as a registered function', function () {
    expect(this.container.functionsContainer.foo.flowFunction).equal(this.foo)
  })

  it('has bar as a registered function', function () {
    expect(this.container.functionsContainer.bar.flowFunction).equal(this.bar)
  })

  it('has aliasFoo equals to foo', function () {
    expect(this.container.functionsContainer.aliasFoo.flowFunction).equal(this.foo)
  })

  it('has otherFunction as a registered sync function', function () {
    expect(this.container.functionsContainer.otherFunction.flowFunction).equal(this.otherFunction)
    expect(this.container.isAsyncFunction('otherFunction')).to.false
  })

  it('has oneMoreFunction as a registered async function merged from other container', function () {
    expect(this.container.functionsContainer.oneMoreFunction.flowFunction).equal(this.oneMoreFunction)
    expect(this.container.isAsyncFunction('oneMoreFunction')).to.true
  })

  it('has foobar as a registered function', function () {
    expect(this.container.functionsContainer.foobar.flowFunction).equal(this.foobar)
  })

  it('has aliasFoobar equals to foobar', function () {
    expect(this.container.functionsContainer.aliasFoobar.flowFunction).equal(this.foobar)
  })

  it('includes the function name on all names', function () {
    const expectedList = ['foo', 'bar', 'aliasFoo', 'otherFunction', 'oneMoreFunction', 'foobar', 'aliasFoobar']
    expect(Array.from(this.container.allFunctionsNames)).to.include.members(expectedList)
  })

  it('generates a name for anonymous function and do not repeat the reference', function () {
    const anonymousFunctionRegisteredList = Array.from(this.container.allFunctionsNames)
      .filter((functionName: string) => functionName.startsWith('anoymous_'))

    expect(anonymousFunctionRegisteredList).to.have.length(1)
    const [anonymousFunctionName] = anonymousFunctionRegisteredList
    expect(anonymousFunctionName).to.match(/^anoymous_[a-z0-9]{9,12}$/)
  })

  it('returns true for the container when checking isFlowieContainer', function () {
    expect(isFlowieContainer(this.container)).to.true
  })

  it('returns false for things that are not created by createFlowieContainer', function () {
    expect(isFlowieContainer({} as any as FlowieContainer)).to.false
    expect(isFlowieContainer(this.foo as FlowieContainer)).to.false
    expect(isFlowieContainer(undefined as FlowieContainer)).to.false
  })

  it('returns the anonymous function by its reference', function () {
    expect(this.container.getFunctionDetails(this.anonymousFunction).flowFunction).to.equal(this.anonymousFunction)
  })

  it('new containers always return false on isAsyncFunction', function () {
    expect(createFlowieContainer().isAsyncFunction('bla')).to.false
  })

  it('new containers always return null on getFunctionDetails', function () {
    expect(createFlowieContainer().getFunctionDetails(stub())).to.null
  })

  it('new containers always return false on isGeneratorFunction', function () {
    expect(createFlowieContainer().isGeneratorFunction('bla')).to.false
  })
})

/* istanbul ignore next */
const generateAnonymousFunction = () => () => ''
