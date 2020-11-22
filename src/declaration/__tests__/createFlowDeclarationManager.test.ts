import { expect } from 'chai'
import createFlowDeclarationManager from '../createFlowDeclarationManager'
import { Flows } from '../../prepared.types'

describe('declaration/createFlowDeclarationManager', function () {
  it('creates a pipe for one item detail', function () {
    const flowDeclaration = createFlowDeclarationManager([
      { name: 'expected', isAsync: true, isGenerator: false, parallelExecutions: 10 },
    ])

    expect(flowDeclaration.flows).to.deep.equal([{ pipe: 'expected', parallelExecutions: 10 }])
  })

  it('creates adds then when pipe declaration', function () {
    const flowDeclaration = createFlowDeclarationManager([
      { name: 'previous', isAsync: false, isGenerator: false, parallelExecutions: 1 },
    ]).pipe({ name: 'expected', isAsync: false, isGenerator: false, parallelExecutions: 1 })

    const expected: Flows = [
      { pipe: 'previous', parallelExecutions: 1 },
      { pipe: 'expected', parallelExecutions: 1 },
    ]

    expect(flowDeclaration.flows).to.deep.equal(expected)
  })

  it('creates N levels when piping declarations', function () {
    const flowDeclaration = createFlowDeclarationManager([
      { name: 'first level', isAsync: true, isGenerator: false, parallelExecutions: 1 },
    ])
      .pipe({ name: 'second level', isAsync: true, isGenerator: false, parallelExecutions: 2 })
      .pipe({ name: 'third level', isAsync: true, isGenerator: false, parallelExecutions: 3 })
      .pipe({ name: 'expected', isAsync: true, isGenerator: false, parallelExecutions: 4 })

    const expected: Flows = [
      { pipe: 'first level', parallelExecutions: 1 },
      { pipe: 'second level', parallelExecutions: 2 },
      { pipe: 'third level', parallelExecutions: 3 },
      { pipe: 'expected', parallelExecutions: 4 },
    ]

    expect(flowDeclaration.flows).to.deep.equal(expected)
  })

  it('creates a splits for more then one item detail', function () {
    const flowDeclaration = createFlowDeclarationManager([
      { name: 'expected', isAsync: true, isGenerator: false, parallelExecutions: 1 },
      { name: 'expected', isAsync: false, isGenerator: false, parallelExecutions: 1 },
    ])

    expect(flowDeclaration.flows).to.deep.equal([{ split: ['expected', 'expected'] }])
  })

  it('creates splits then splits the pipe correctly', function () {
    const flowDeclaration = createFlowDeclarationManager([
      { name: 'split', isAsync: true, isGenerator: false, parallelExecutions: 1 },
      { name: 'split', isAsync: false, isGenerator: false, parallelExecutions: 1 },
    ])
      .split([
        { name: 'split', isAsync: true, isGenerator: false, parallelExecutions: 1 },
        { name: 'split', isAsync: false, isGenerator: false, parallelExecutions: 1 },
      ])
      .pipe({ name: 'pipe', isAsync: true, isGenerator: false, parallelExecutions: 1 })
      .split([
        { name: 'split', isAsync: true, isGenerator: false, parallelExecutions: 1 },
        { name: 'split', isAsync: false, isGenerator: false, parallelExecutions: 1 },
      ])
      .pipe({ name: 'pipe', isAsync: true, isGenerator: false, parallelExecutions: 1 })
      .pipe({ name: 'pipe', isAsync: true, isGenerator: false, parallelExecutions: 1 })
      .pipe({ name: 'pipe', isAsync: true, isGenerator: false, parallelExecutions: 1 })
      .split([
        { name: 'split', isAsync: true, isGenerator: false, parallelExecutions: 1 },
        { name: 'split', isAsync: false, isGenerator: false, parallelExecutions: 1 },
      ])
      .split([
        { name: 'split', isAsync: true, isGenerator: false, parallelExecutions: 1 },
        { name: 'split', isAsync: false, isGenerator: false, parallelExecutions: 1 },
      ])

    const expected: Flows = [
      { split: ['split', 'split'] },
      { split: ['split', 'split'] },
      { pipe: 'pipe', parallelExecutions: 1 },
      { split: ['split', 'split'] },
      { pipe: 'pipe', parallelExecutions: 1 },
      { pipe: 'pipe', parallelExecutions: 1 },
      { pipe: 'pipe', parallelExecutions: 1 },
      { split: ['split', 'split'] },
      { split: ['split', 'split'] },
    ]

    expect(flowDeclaration.flows).to.deep.equal(expected)
  })

  it('collects unique function names', function () {
    const flowDeclaration = createFlowDeclarationManager([
      { name: 'split', isAsync: true, isGenerator: false, parallelExecutions: 1 },
      { name: 'split', isAsync: false, isGenerator: false, parallelExecutions: 1 },
    ])
      .split([
        { name: 'split', isAsync: true, isGenerator: false, parallelExecutions: 1 },
        { name: 'split', isAsync: false, isGenerator: false, parallelExecutions: 1 },
      ])
      .pipe({ name: 'pipe', isAsync: false, isGenerator: false, parallelExecutions: 1 })
      .split([
        { name: 'split', isAsync: true, isGenerator: false, parallelExecutions: 1 },
        { name: 'split', isAsync: false, isGenerator: false, parallelExecutions: 1 },
      ])
      .pipe({ name: 'pipe', isAsync: false, isGenerator: false, parallelExecutions: 1 })
      .pipe({ name: 'pipe', isAsync: false, isGenerator: false, parallelExecutions: 1 })
      .pipe({ name: 'pipe', isAsync: false, isGenerator: false, parallelExecutions: 1 })
      .split([
        { name: 'split', isAsync: true, isGenerator: false, parallelExecutions: 1 },
        { name: 'split', isAsync: false, isGenerator: false, parallelExecutions: 1 },
      ])
      .split([
        { name: 'split', isAsync: true, isGenerator: false, parallelExecutions: 1 },
        { name: 'split', isAsync: false, isGenerator: false, parallelExecutions: 1 },
      ])

    expect(Array.from(flowDeclaration.allFunctionsNames)).to.deep.equal(['split', 'pipe'])
  })
})
