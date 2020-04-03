import { readFileSync } from 'fs'
import path from 'path'
import { expect } from 'chai'
import beautify from 'js-beautify'

import { FlowieExecutionDeclaration } from '../../types'

import generateFunctionFromFlowDeclaration from '../generateFunctionFromFlowDeclaration'
import { FlowieContainer } from '../../container/createFlowieContainer'

const pathOfFixtures = path.join(__dirname, '..', '__fixtures__')

// eslint-disable-next-line max-params
export default function testFunctionGenerations (
  fixtureName: string,
  flowDeclaration: FlowieExecutionDeclaration,
  flowieContainer: FlowieContainer,
  expectedFunctionConstructor: FunctionConstructor
) {
  return function () {
    const expectedFixture = readFileSync(path.join(pathOfFixtures, `${fixtureName}.fixture.js`)).toString().trim()
    const { generatedFlowFunction } = generateFunctionFromFlowDeclaration(flowDeclaration, flowieContainer)

    expect(generatedFlowFunction).to.instanceOf(expectedFunctionConstructor)

    // eslint-disable-next-line @typescript-eslint/camelcase
    const jsBeautifyOptions = { indent_size: 2, eol: '\n' }
    const beautifiedCode = beautify(generatedFlowFunction.toString(), jsBeautifyOptions)

    expect(beautifiedCode).to.equal(expectedFixture)
  }
}
