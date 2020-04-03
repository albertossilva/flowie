import { expect } from 'chai'
import createFlowDeclarationManager from '../createFlowDeclarationManager'
import { Flows } from '../../types'

describe('declaration/createFlowDeclarationManager', function () {
  it('creates a pipe for one item detail', function () {
    const flowDeclaration = createFlowDeclarationManager([{ name: 'expected', isAsync: true }])

    expect(flowDeclaration.flows).to.deep.equal([{ pipe: { function: 'expected' } }])
  })

  it('creates adds then when pipe declaration', function () {
    const flowDeclaration = createFlowDeclarationManager([{ name: 'previous', isAsync: false }])
      .pipe({ name: 'expected', isAsync: false })

    const expected: Flows = [
      { pipe: { function: 'previous' } },
      { pipe: { function: 'expected' } }
    ]

    expect(flowDeclaration.flows).to.deep.equal(expected)
  })

  it('creates N levels when piping declarations', function () {
    const flowDeclaration = createFlowDeclarationManager([{ name: 'first level', isAsync: true }])
      .pipe({ name: 'second level', isAsync: true })
      .pipe({ name: 'third level', isAsync: true })
      .pipe({ name: 'expected', isAsync: true })

    const expected: Flows = [
      { pipe: { function: 'first level' } },
      { pipe: { function: 'second level' } },
      { pipe: { function: 'third level' } },
      { pipe: { function: 'expected' } }
    ]

    expect(flowDeclaration.flows).to.deep.equal(expected)
  })

  it('creates a splits for more then one item detail', function () {
    const flowDeclaration = createFlowDeclarationManager([
      { name: 'expected', isAsync: true },
      { name: 'expected', isAsync: false }
    ])

    expect(flowDeclaration.flows).to.deep.equal([{ split: { functions: ['expected', 'expected'] } }])
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
      { split: { functions: ['split', 'split'] } },
      { split: { functions: ['split', 'split'] } },
      { pipe: { function: 'pipe' } },
      { split: { functions: ['split', 'split'] } },
      { pipe: { function: 'pipe' } },
      { pipe: { function: 'pipe' } },
      { pipe: { function: 'pipe' } },
      { split: { functions: ['split', 'split'] } },
      { split: { functions: ['split', 'split'] } }
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

    expect(flowDeclaration.allFunctionsNames.toJS()).to.deep.equal(['split', 'pipe'])
  })
})
