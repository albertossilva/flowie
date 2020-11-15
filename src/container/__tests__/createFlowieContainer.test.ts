import { expect, assert } from 'chai'
import { stub } from 'sinon'

import createFlowieContainer, { isFlowieContainer, FlowieContainer } from '../createFlowieContainer'

describe('container/createFlowieContainer', function () {
  // eslint-disable-next-line functional/no-let
  let container: FlowieContainer

  before(function () {
    const foo = stub().named('foo')
    const overridden = stub().named('overridden')
    const bar = stub().named('bar')
    const foobar = stub().named('foobar')
    const otherFunction = stub().named('otherFunction')
    const anonymousFunction = generateAnonymousFunction()
    const oneMoreFunction = stub().named('oneMoreFunction')
    oneMoreFunction[Symbol.toStringTag] = 'AsyncFunction'

    const generatorFunction = stub().named('generatorFunction')
    generatorFunction[Symbol.toStringTag] = 'GeneratorFunction'

    this.foo = foo
    this.overridden = overridden
    this.bar = bar
    this.foobar = foobar
    this.otherFunction = otherFunction
    this.oneMoreFunction = oneMoreFunction
    this.generatorFunction = generatorFunction
    this.anonymousFunction = anonymousFunction

    const otherContainer = createFlowieContainer().register(this.foo, this.bar)
    const oneMoreContainer = createFlowieContainer().register(this.oneMoreFunction)

    container = createFlowieContainer()
      .register(this.foo)
      .register(this.foo, this.bar)
      .register(['aliasFoo', this.overridden])
      .register(['aliasFoo', this.foo])
      .register(['aliasFoo', this.foo])
      .merge(this.otherFunction, oneMoreContainer, { just: 'skipped' } as any)
      .merge(otherContainer)
      .register(this.foobar, ['aliasFoobar', this.foobar])
      .register(this.anonymousFunction)
      .register({ generatorFunction, parallelExecutions: 10 })
      .register({ generatorFunction })
      .register(this.anonymousFunction, this.anonymousFunction, {
        generatorFunction,
        alias: 'generatorAlias',
        parallelExecutions: 2,
      })
      .register({ generatorFunction, alias: 'generatorAlias' })
      .register({ generatorFunction, parallelExecutions: 3 })
      .register({ generatorFunction, parallelExecutions: 3 })
  })

  it('has 11 functions registered', function () {
    expect(container.allFunctionsNames.size).to.equal(10)
  })

  function validateFunctionOnContainer(options: { readonly functionName: string; readonly aliasName?: string }) {
    const { functionName, aliasName = functionName } = options

    return function () {
      assert.property(container.functionsContainer, aliasName, `There is no function called ${aliasName}`)
      expect(container.functionsContainer[aliasName].flowFunction).equal(this[functionName])
    }
  }

  it('has foo as a registered function', validateFunctionOnContainer({ functionName: 'foo' }))
  it('has bar as a registered function', validateFunctionOnContainer({ functionName: 'bar' }))
  it(
    'has aliasFoo equals to foo overriding previous alias',
    validateFunctionOnContainer({ functionName: 'foo', aliasName: 'aliasFoo' }),
  )

  it('has otherFunction as a registered async function', validateFunctionOnContainer({ functionName: 'otherFunction' }))
  it('has otherFunction as async function', function () {
    expect(container.isAsyncFunction('otherFunction')).to.false
  })

  it(
    'has oneMoreFunction as a registered async function merged from other container',
    validateFunctionOnContainer({ functionName: 'oneMoreFunction' }),
  )

  it('has oneMoreFunction as async', function () {
    expect(container.isAsyncFunction('oneMoreFunction')).to.true
  })

  it('has foobar as a registered function', validateFunctionOnContainer({ functionName: 'foobar' }))

  it(
    'has aliasFoobar equals to foobar',
    validateFunctionOnContainer({ functionName: 'foobar', aliasName: 'aliasFoobar' }),
  )

  it('includes the function name on all names', function () {
    const expectedList = ['foo', 'bar', 'aliasFoo', 'otherFunction', 'oneMoreFunction', 'foobar', 'aliasFoobar']
    expect(Array.from(container.allFunctionsNames)).to.include.members(expectedList)
  })

  it('generates a name for anonymous function and do not repeat the reference', function () {
    const anonymousFunctionRegisteredList = Array.from(container.allFunctionsNames).filter((functionName: string) =>
      functionName.startsWith('anonymous_'),
    )

    expect(anonymousFunctionRegisteredList).to.have.length(1)
    const [anonymousFunctionName] = anonymousFunctionRegisteredList
    expect(anonymousFunctionName).to.match(/^anonymous_[a-z0-9]{9,12}$/)
  })

  it('has generatorFunction added through details', validateFunctionOnContainer({ functionName: 'generatorFunction' }))
  it(
    'has generatorAlias as alias for generatorFunction added from details',
    validateFunctionOnContainer({ functionName: 'generatorFunction', aliasName: 'generatorAlias' }),
  )

  it('returns true for the container when checking isFlowieContainer', function () {
    expect(isFlowieContainer(container)).to.true
  })

  it('returns false for things that are not created by createFlowieContainer', function () {
    expect(isFlowieContainer(({} as any) as FlowieContainer)).to.false
    expect(isFlowieContainer(this.foo as FlowieContainer)).to.false
    expect(isFlowieContainer(undefined as FlowieContainer)).to.false
  })

  // it('returns the anonymous function by its reference', function () {
  //   expect(container.getFunctionDetails(this.anonymousFunction).flowFunction).to.equal(this.anonymousFunction)
  // })

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
