/* eslint-disable mocha/no-setup-in-describe */
import { readFileSync } from 'fs'
import path from 'path'
import { expect } from 'chai'
import { Set as ImmutableSet } from 'immutable'
import beautify from 'js-beautify'

import { FlowDeclaration } from '../../types'

import generateFunctionFromFlowDeclaration from '../generateFunctionFromFlowDeclaration'

const pathOfFixtures = path.join(__dirname, '..', '__fixtures__')
const flowDeclarations: Record<string, FlowDeclaration> = {
  pipeOneSyncFunction: {
    allFunctionsNames: ImmutableSet(['firstFlowieItem']),
    flows: [
      { pipe: { function: 'firstFlowieItem' } }
    ]
  },
  pipeMoreThanOneSyncFunction: {
    allFunctionsNames: ImmutableSet(['firstFlowieItem', 'secondFlowieItem', 'thirdFlowieItem']),
    flows: [
      { pipe: { function: 'firstFlowieItem' } },
      { pipe: { function: 'secondFlowieItem' } },
      { pipe: { function: 'thirdFlowieItem' } }
    ]
  }
}

const testCases: CompilerTestCases = {
  pipeOneSyncFunction: {
    description: 'generates no async function when there is one async function pipe',
    flowDeclaration: flowDeclarations.pipeOneSyncFunction
  },
  pipeMoreThanOneSyncFunction: {
    description: 'generates no async function when there for more than one sync function',
    flowDeclaration: flowDeclarations.pipeMoreThanOneSyncFunction
  }
}

describe('compiler/generateFunctionFromFlowDeclaration', function () {
  Object.entries(testCases).forEach(function ([fixtureName, testCase]: readonly [FixtureName, TestCase]) {
    it(testCase.description, function () {
      const expectedFixture = readFileSync(path.join(pathOfFixtures, `${fixtureName}.fixture.js`)).toString().trim()
      const generatedFunction = generateFunctionFromFlowDeclaration(testCase.flowDeclaration)

      // eslint-disable-next-line @typescript-eslint/camelcase
      const jsBeautifyOptions = { indent_size: 2, eol: '\n' }
      const beautifiedCode = beautify(generatedFunction.generatedFlowFunction.toString(), jsBeautifyOptions)

      expect(beautifiedCode).to.equal(expectedFixture)
    })
  })
})

type FixtureName = string
interface TestCase {
  readonly description: string
  readonly flowDeclaration: FlowDeclaration
}
type CompilerTestCases = Record<FixtureName, TestCase>
