import { assert, expect } from 'chai'
import { random } from 'faker'
import { stub } from 'sinon'
import { PreparedFlowieExecution } from '../../prepared.types'

import convertFlowDeclarationToRunnableDeclaration, {
  RunnableDeclaration
} from '../convertFlowDeclarationToRunnableDeclaration'

describe('compiler/convertFlowDeclarationToRunnableDeclaration', function () {
  after(function () {
    Math.random = this.oldMathRandom
  })
  before(function () {
    this.oldMathRandom = Math.random
    Math.random = fakeMathRandom()

    const preparedFlowieExecution: PreparedFlowieExecution = {
      isAsync: random.boolean(),
      allFunctionsNames: new Set(['it is not used']),
      flows: [
        { pipe: 'firstFlowieItem' },
        {
          flows: [
            { pipe: 'secondFlowieItem' },
            {
              flows: [
                {
                  split: [
                    'thirdFlowieItem',
                    { flows: [{ pipe: 'fourthFlowieItem' }, { pipe: 'fifthFlowieItem' }], name: 'deepFlow' }]
                }
              ],
              name: 'secondLevelFlow'
            },
            { pipe: { pipe: 'sixthFlowieItem' /* anonymous flow */ } }
          ],
          name: 'firstLevelFlow'
        },
        { pipe: 'firstFlowieItem' },
        {
          split: [
            'seventhFlowieItem',
            { split: ['eighthFlowieItem', { pipe: 'ninethFlowieItem' }], name: 'splitIASplit' }
          ]
        },
        { pipe: { pipe: 'lastItem', name: 'pipeInPipe' } },
        { pipe: 'generator' },
        { flows: [{ pipe: 'generator' }, { pipe: 'generator' }, { pipe: 'belowTheGenerator' }], name: 'subGenerator' },
        { split: ['otherGenerator', 'lastItem'] },
        { flows: [{ split: ['otherGenerator', 'lastItem'] }], name: 'generatorInSplitInSubFlow' }
      ]
    }

    const isAsyncFunctionStub = stub().named('isAsyncFunction')
    isAsyncFunctionStub.returns(false)
    isAsyncFunctionStub.withArgs('fourthFlowieItem').returns(true)
    isAsyncFunctionStub.withArgs('ninethFlowieItem').returns(true)
    isAsyncFunctionStub.withArgs('otherGenerator').returns(true)

    const isAsyncFunction = isAsyncFunctionStub as (functionName: string) => boolean

    const isGeneratorFunctionStub = stub().named('isGeneratorFunction')
    isGeneratorFunctionStub.returns(false)
    isGeneratorFunctionStub.withArgs('generator').returns(true)
    isGeneratorFunctionStub.withArgs('otherGenerator').returns(true)

    const isGeneratorFunction = isGeneratorFunctionStub as (functionName: string) => boolean

    this.runnableDeclaration = convertFlowDeclarationToRunnableDeclaration(
      preparedFlowieExecution,
      isAsyncFunction,
      isGeneratorFunction
    )
    this.preparedFlowieExecution = preparedFlowieExecution
  })

  it('copies isAsync from flowieDeclaration', function () {
    const runnableDeclaration = this.runnableDeclaration as RunnableDeclaration
    const flowieDeclaration = this.preparedFlowieExecution as PreparedFlowieExecution
    expect(runnableDeclaration.isAsync).to.equal(flowieDeclaration.isAsync)
  })

  it('creates on sub flow for each under the first flows', function () {
    const runnableDeclaration = this.runnableDeclaration as RunnableDeclaration
    expect(runnableDeclaration.subFlows).to.have.length(11)
  })

  it('reads all functions for main function', function () {
    const runnableDeclaration = this.runnableDeclaration as RunnableDeclaration
    expect(runnableDeclaration.mainFlow.functionsFromContainers)
      .to.deep.equal(['firstFlowieItem', 'seventhFlowieItem', 'generator', 'lastItem'])
  })

  it('reads all steps for main function', function () {
    const runnableDeclaration = this.runnableDeclaration as RunnableDeclaration
    expect(runnableDeclaration.mainFlow.steps)
      .to.deep.equal([
        { pipe: 'firstFlowieItem', isAsync: false },
        { flow: 'firstLevelFlow', isAsync: true },
        { pipe: 'firstFlowieItem', isAsync: false },
        { split: ['seventhFlowieItem', { flow: 'splitIASplit', isAsync: true }], isAsync: true },
        { flow: 'pipeInPipe', isAsync: false },
        { generator: 'generator', isAsync: false },
        { flow: 'subGenerator', isAsync: false },
        { split: [{ flow: 'generator_on_split_otherGenerator', isAsync: true }, 'lastItem'], isAsync: true },
        { flow: 'generatorInSplitInSubFlow', isAsync: true },
        { finishGeneratorsCount: 1 }
      ])
  })

  it('reads functions on firstLevelFlow subFlow', function () {
    const firstLevelFlow = getSubFlowByHash(this.runnableDeclaration, 'firstLevelFlow')
    expect(firstLevelFlow.functionsFromContainers).to.deep.equal(['secondFlowieItem'])
  })

  it('reads steps on firstLevelFlow subFlow', function () {
    const firstLevelFlow = getSubFlowByHash(this.runnableDeclaration, 'firstLevelFlow')
    expect(firstLevelFlow.steps).to.have.length(3)
    expect(firstLevelFlow.steps[0]).to.deep.equal({ pipe: 'secondFlowieItem', isAsync: false })
    expect(firstLevelFlow.steps[1]).to.deep.equal({ flow: 'secondLevelFlow', isAsync: true })
    expect((firstLevelFlow.steps[2] as any).flow).to.match(/^[a-z0-9]{9,12}$/)
    expect((firstLevelFlow.steps[2] as any).isAsync).to.false
  })

  it('reads one functions secondLevelFlow', function () {
    const secondLevelFlow = getSubFlowByHash(this.runnableDeclaration, 'secondLevelFlow')
    expect(secondLevelFlow.functionsFromContainers).to.deep.equal(['thirdFlowieItem'])
  })

  it('reads steps on secondLevelFlow subFlow', function () {
    const secondLevelFlow = getSubFlowByHash(this.runnableDeclaration, 'secondLevelFlow')
    expect(secondLevelFlow.steps).to.deep.equal([
      { split: ['thirdFlowieItem', { flow: 'deepFlow', isAsync: true }], isAsync: true }
    ])
  })

  it('reads two functions on deepFlow subFlow', function () {
    const deepFlow = getSubFlowByHash(this.runnableDeclaration, 'deepFlow')
    expect(deepFlow.functionsFromContainers).to.deep.equal(['fourthFlowieItem', 'fifthFlowieItem'])
  })

  it('reads steps on deepFlow subFlow', function () {
    const deepFlow = getSubFlowByHash(this.runnableDeclaration, 'deepFlow')
    expect(deepFlow.steps).to.deep.equal([
      { pipe: 'fourthFlowieItem', isAsync: true },
      { pipe: 'fifthFlowieItem', isAsync: false }
    ])
  })

  it('reads one function on anonymousFunction', function () {
    const anonymousFlow = (this.runnableDeclaration as RunnableDeclaration).subFlows[3]
    expect(anonymousFlow.functionsFromContainers).to.deep.equal(['sixthFlowieItem'])
  })

  it('reads steps on anonymousFlow subFlow', function () {
    const anonymousFlow = (this.runnableDeclaration as RunnableDeclaration).subFlows[3]
    expect(anonymousFlow.steps).to.deep.equal([{ pipe: 'sixthFlowieItem', isAsync: false }])
  })

  it('reads one function on splitIASplit flow', function () {
    const splitIASplit = getSubFlowByHash(this.runnableDeclaration, 'splitIASplit')
    expect(splitIASplit.functionsFromContainers).to.deep.equal(['eighthFlowieItem'])
  })

  it('reads steps on splitIASplit subFlow', function () {
    const splitIASplit = getSubFlowByHash(this.runnableDeclaration, 'splitIASplit')
    const steps = splitIASplit.steps
    expect(steps).to.have.length(1)
    const [splitStep] = steps
    expect((splitStep as any).isAsync).to.true
    expect((splitStep as any).split[0]).to.equal('eighthFlowieItem')
    expect((splitStep as any).split[1].flow).to.match(/^[a-z0-9]{9,12}$/)
    expect((splitStep as any).split[1].isAsync).to.true
  })

  it('reads one function on anonymousFlow inside splitIASplit flow', function () {
    const anonymousFlowInsideSplit = (this.runnableDeclaration as RunnableDeclaration).subFlows[5]
    expect(anonymousFlowInsideSplit.functionsFromContainers).to.deep.equal(['ninethFlowieItem'])
  })

  it('reads steps on anonymousFlow inside splitIASplit flow', function () {
    const anonymousFlowInsideSplit = (this.runnableDeclaration as RunnableDeclaration).subFlows[5]
    expect(anonymousFlowInsideSplit.hash).to.match(/^[a-z0-9]{9,12}$/)
    expect(anonymousFlowInsideSplit.steps).to.deep.equal([{ pipe: 'ninethFlowieItem', isAsync: true }])
  })

  it('creates steps on anonymousFlow inside splitIASplit flow', function () {
    const pipeInPipe = getSubFlowByHash(this.runnableDeclaration, 'pipeInPipe')
    expect(pipeInPipe.steps).to.deep.equal([{
      pipe: 'lastItem',
      isAsync: false
    }])
  })

  it('creates steps for subGenerator flow', function () {
    const subGenerator = getSubFlowByHash(this.runnableDeclaration, 'subGenerator')
    expect(subGenerator.functionsFromContainers).to.deep.equals(['generator', 'belowTheGenerator'])
    expect(subGenerator.steps).to.deep.equal([
      { generator: 'generator', isAsync: false },
      { generator: 'generator', isAsync: false },
      { pipe: 'belowTheGenerator', isAsync: false },
      { finishGeneratorsCount: 2 }
    ])
  })

  it('creates steps for generatorInSplitInSubFlow flow', function () {
    const generatorInSplitInSubFlow = getSubFlowByHash(this.runnableDeclaration, 'generatorInSplitInSubFlow')
    expect(generatorInSplitInSubFlow.isAsync).to.true
    expect(generatorInSplitInSubFlow.functionsFromContainers).to.deep.equal(['lastItem'])
    expect(generatorInSplitInSubFlow.hash).to.equal('generatorInSplitInSubFlow')
    expect(generatorInSplitInSubFlow.steps).to.have.length(1)
    expect((generatorInSplitInSubFlow.steps[0] as any).isAsync).to.true
    expect((generatorInSplitInSubFlow.steps[0] as any).split[0].flow).to.equal('generator_on_split_otherGenerator')
    expect((generatorInSplitInSubFlow.steps[0] as any).split[0].isAsync).to.true
    expect((generatorInSplitInSubFlow.steps[0] as any).split[1]).to.equal('lastItem')
  })

  it('creates subflow for generator in split in the flow generatorInSplitInSubFlow', function () {
    const splitGeneratorSubFlow = (this.runnableDeclaration as RunnableDeclaration).subFlows[10]
    expect(splitGeneratorSubFlow).to.deep.equal({
      isAsync: false,
      functionsFromContainers: ['otherGenerator'],
      hash: 'generator_on_split_otherGenerator',
      steps: [{ generator: 'otherGenerator', isAsync: false }, { finishGeneratorsCount: 1 }]
    })
  })
})

function getSubFlowByHash (runnableDeclaration: RunnableDeclaration, subFlowHash: string) {
  const subFlow = runnableDeclaration.subFlows.find((subFlow: any) => subFlow.hash === subFlowHash)
  const hashes = runnableDeclaration.subFlows.map((subFlow: any) => subFlow.hash).join(', ')
  assert.isNotNull(subFlow, `No subflow with hash ${subFlowHash}, hashes avaiable: ${hashes}`)

  return subFlow
}

function fakeMathRandom () {
  // eslint-disable-next-line functional/no-let
  let i = 0.1
  return function random () {
    const randomValue = i
    i += 0.1
    return randomValue
  }
}
