import { readFileSync } from 'fs'
import path from 'path'
import { expect } from 'chai'
import beautify from 'js-beautify'

import { PreparedFlowieExecution } from '../../prepared.types'

import generateFunctionFromFlowDeclaration from '../generateFunctionFromFlowDeclaration'
import { FlowieContainer } from '../../container/createFlowieContainer'

const pathOfFixtures = path.join(__dirname, '..', '__fixtures__')

export default function testFunctionGenerations (
  fixtureName: string,
  preparedFlowieExecution: PreparedFlowieExecution,
  flowieContainer: FlowieContainer
) {
  return function () {
    const expectedFixture = readFileSync(path.join(pathOfFixtures, `${fixtureName}.fixture.js`)).toString().trim()
    const { generatedFlowFunction } = generateFunctionFromFlowDeclaration(preparedFlowieExecution, flowieContainer)

    const jsBeautifyOptions = { indent_size: 2, eol: '\n' }
    const beautifiedCode = beautify(generatedFlowFunction.toString(), jsBeautifyOptions)

    expect(expectedFixture).to.equal(beautifiedCode)
  }
}
