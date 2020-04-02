import { expect } from 'chai'
import createFlowDeclaration from '../createFlowDeclaration'
import { Flows } from '../../types'

describe('declaration/createFlowDeclaration', function () {
  it('creates a pipe for one item detail', function () {
    const flowDeclaration = createFlowDeclaration([{ name: 'expected' }])

    expect(flowDeclaration.flows).to.deep.equal([{ pipe: { function: 'expected' } }])
  })

  it('creates adds then when pipe declaration', function () {
    const flowDeclaration = createFlowDeclaration([{ name: 'previous' }]).pipe({ name: 'expected' })

    const expected: Flows = [
      { pipe: { function: 'previous' } },
      { pipe: { function: 'expected' } }
    ]

    expect(flowDeclaration.flows).to.deep.equal(expected)
  })

  it('creates N levels when piping declarations', function () {
    const flowDeclaration = createFlowDeclaration([{ name: 'first level' }])
      .pipe({ name: 'second level' })
      .pipe({ name: 'third level' })
      .pipe({ name: 'expected' })

    const expected: Flows = [
      { pipe: { function: 'first level' } },
      { pipe: { function: 'second level' } },
      { pipe: { function: 'third level' } },
      { pipe: { function: 'expected' } }
    ]

    expect(flowDeclaration.flows).to.deep.equal(expected)
  })

  it('creates a splits for more then one item detail', function () {
    const flowDeclaration = createFlowDeclaration([{ name: 'expected' }, { name: 'expected' }])

    expect(flowDeclaration.flows).to.deep.equal([{ split: { functions: ['expected', 'expected'] } }])
  })

  it('creates splits then splits the pipe correctly', function () {
    const flowDeclaration = createFlowDeclaration([{ name: 'split' }, { name: 'split' }])
      .split([{ name: 'split' }, { name: 'split' }])
      .pipe({ name: 'pipe' })
      .split([{ name: 'split' }, { name: 'split' }])
      .pipe({ name: 'pipe' })
      .pipe({ name: 'pipe' })
      .pipe({ name: 'pipe' })
      .split([{ name: 'split' }, { name: 'split' }])
      .split([{ name: 'split' }, { name: 'split' }])

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

  it('collects individually all function names', function () {
    const flowDeclaration = createFlowDeclaration([{ name: 'split' }, { name: 'split' }])
      .split([{ name: 'split' }, { name: 'split' }])
      .pipe({ name: 'pipe' })
      .split([{ name: 'split' }, { name: 'split' }])
      .pipe({ name: 'pipe' })
      .pipe({ name: 'pipe' })
      .pipe({ name: 'pipe' })
      .split([{ name: 'split' }, { name: 'split' }])
      .split([{ name: 'split' }, { name: 'split' }])

    expect(flowDeclaration.allFunctionsNames.toJS()).to.deep.equal(['split', 'pipe'])
  })
})
