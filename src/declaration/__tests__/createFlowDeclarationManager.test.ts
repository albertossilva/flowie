import { expect } from 'chai'
import createFlowDeclarationManager from '../createFlowDeclarationManager'
import { Flows } from '../../prepared.types'

describe('declaration/createFlowDeclarationManager', function () {
  it('creates a pipe for one item detail', function () {
    const flowDeclaration = createFlowDeclarationManager([{ name: 'expected', isAsync: true, isGenerator: false }])

    expect(flowDeclaration.flows).to.deep.equal([{ pipe: 'expected' }])
  })

  it('creates adds then when pipe declaration', function () {
    const flowDeclaration = createFlowDeclarationManager([{ name: 'previous', isAsync: false, isGenerator: false }])
      .pipe({ name: 'expected', isAsync: false, isGenerator: false })

    const expected: Flows = [
      { pipe: 'previous' },
      { pipe: 'expected' }
    ]

    expect(flowDeclaration.flows).to.deep.equal(expected)
  })

  it('creates N levels when piping declarations', function () {
    const flowDeclaration = createFlowDeclarationManager([{ name: 'first level', isAsync: true, isGenerator: false }])
      .pipe({ name: 'second level', isAsync: true, isGenerator: false })
      .pipe({ name: 'third level', isAsync: true, isGenerator: false })
      .pipe({ name: 'expected', isAsync: true, isGenerator: false })

    const expected: Flows = [
      { pipe: 'first level' },
      { pipe: 'second level' },
      { pipe: 'third level' },
      { pipe: 'expected' }
    ]

    expect(flowDeclaration.flows).to.deep.equal(expected)
  })

  it('creates a splits for more then one item detail', function () {
    const flowDeclaration = createFlowDeclarationManager([
      { name: 'expected', isAsync: true, isGenerator: false },
      { name: 'expected', isAsync: false, isGenerator: false }
    ])

    expect(flowDeclaration.flows).to.deep.equal([{ split: ['expected', 'expected'] }])
  })

  it('creates splits then splits the pipe correctly', function () {
    const flowDeclaration = createFlowDeclarationManager([
      { name: 'split', isAsync: true, isGenerator: false },
      { name: 'split', isAsync: false, isGenerator: false }
    ])
      .split([
        { name: 'split', isAsync: true, isGenerator: false },
        { name: 'split', isAsync: false, isGenerator: false }
      ])
      .pipe({ name: 'pipe', isAsync: true, isGenerator: false })
      .split([
        { name: 'split', isAsync: true, isGenerator: false },
        { name: 'split', isAsync: false, isGenerator: false }
      ])
      .pipe({ name: 'pipe', isAsync: true, isGenerator: false })
      .pipe({ name: 'pipe', isAsync: true, isGenerator: false })
      .pipe({ name: 'pipe', isAsync: true, isGenerator: false })
      .split([
        { name: 'split', isAsync: true, isGenerator: false },
        { name: 'split', isAsync: false, isGenerator: false }
      ])
      .split([
        { name: 'split', isAsync: true, isGenerator: false },
        { name: 'split', isAsync: false, isGenerator: false }
      ])

    const expected: Flows = [
      { split: ['split', 'split'] },
      { split: ['split', 'split'] },
      { pipe: 'pipe' },
      { split: ['split', 'split'] },
      { pipe: 'pipe' },
      { pipe: 'pipe' },
      { pipe: 'pipe' },
      { split: ['split', 'split'] },
      { split: ['split', 'split'] }
    ]

    expect(flowDeclaration.flows).to.deep.equal(expected)
  })

  it('collects unique function names', function () {
    const flowDeclaration = createFlowDeclarationManager([
      { name: 'split', isAsync: true, isGenerator: false },
      { name: 'split', isAsync: false, isGenerator: false }
    ])
      .split([
        { name: 'split', isAsync: true, isGenerator: false },
        { name: 'split', isAsync: false, isGenerator: false }
      ])
      .pipe({ name: 'pipe', isAsync: false, isGenerator: false })
      .split([
        { name: 'split', isAsync: true, isGenerator: false },
        { name: 'split', isAsync: false, isGenerator: false }
      ])
      .pipe({ name: 'pipe', isAsync: false, isGenerator: false })
      .pipe({ name: 'pipe', isAsync: false, isGenerator: false })
      .pipe({ name: 'pipe', isAsync: false, isGenerator: false })
      .split([
        { name: 'split', isAsync: true, isGenerator: false },
        { name: 'split', isAsync: false, isGenerator: false }
      ])
      .split([
        { name: 'split', isAsync: true, isGenerator: false },
        { name: 'split', isAsync: false, isGenerator: false }
      ])

    expect(Array.from(flowDeclaration.allFunctionsNames)).to.deep.equal(['split', 'pipe'])
  })
})
