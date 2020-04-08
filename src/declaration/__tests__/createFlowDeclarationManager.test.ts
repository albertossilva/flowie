import { expect } from 'chai'
import createFlowDeclarationManager from '../createFlowDeclarationManager'
import { Flows } from '../../types'

describe('declaration/createFlowDeclarationManager', function () {
  it('creates a pipe for one item detail', function () {
    const flowDeclaration = createFlowDeclarationManager([{ name: 'expected', isAsync: true }])

    expect(flowDeclaration.flows).to.deep.equal([{ pipe: 'expected' }])
  })

  it('creates adds then when pipe declaration', function () {
    const flowDeclaration = createFlowDeclarationManager([{ name: 'previous', isAsync: false }])
      .pipe({ name: 'expected', isAsync: false })

    const expected: Flows = [
      { pipe: 'previous' },
      { pipe: 'expected' }
    ]

    expect(flowDeclaration.flows).to.deep.equal(expected)
  })

  it('creates N levels when piping declarations', function () {
    const flowDeclaration = createFlowDeclarationManager([{ name: 'first level', isAsync: true }])
      .pipe({ name: 'second level', isAsync: true })
      .pipe({ name: 'third level', isAsync: true })
      .pipe({ name: 'expected', isAsync: true })

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
      { name: 'expected', isAsync: true },
      { name: 'expected', isAsync: false }
    ])

    expect(flowDeclaration.flows).to.deep.equal([{ split: ['expected', 'expected'] }])
  })

  it('creates splits then splits the pipe correctly', function () {
    const flowDeclaration = createFlowDeclarationManager([
      { name: 'split', isAsync: true },
      { name: 'split', isAsync: false }
    ])
      .split([
        { name: 'split', isAsync: true },
        { name: 'split', isAsync: false }
      ])
      .pipe({ name: 'pipe', isAsync: true })
      .split([
        { name: 'split', isAsync: true },
        { name: 'split', isAsync: false }
      ])
      .pipe({ name: 'pipe', isAsync: true })
      .pipe({ name: 'pipe', isAsync: true })
      .pipe({ name: 'pipe', isAsync: true })
      .split([
        { name: 'split', isAsync: true },
        { name: 'split', isAsync: false }
      ])
      .split([
        { name: 'split', isAsync: true },
        { name: 'split', isAsync: false }
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
      { name: 'split', isAsync: true },
      { name: 'split', isAsync: false }
    ])
      .split([
        { name: 'split', isAsync: true },
        { name: 'split', isAsync: false }
      ])
      .pipe({ name: 'pipe', isAsync: false })
      .split([
        { name: 'split', isAsync: true },
        { name: 'split', isAsync: false }
      ])
      .pipe({ name: 'pipe', isAsync: false })
      .pipe({ name: 'pipe', isAsync: false })
      .pipe({ name: 'pipe', isAsync: false })
      .split([
        { name: 'split', isAsync: true },
        { name: 'split', isAsync: false }
      ])
      .split([
        { name: 'split', isAsync: true },
        { name: 'split', isAsync: false }
      ])

    expect(Array.from(flowDeclaration.allFunctionsNames)).to.deep.equal(['split', 'pipe'])
  })
})
