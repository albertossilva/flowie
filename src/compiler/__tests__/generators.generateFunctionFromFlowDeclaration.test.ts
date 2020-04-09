import createFlowieContainer from '../../container/createFlowieContainer'
import { FlowieExecutionDeclaration } from '../../types'

import { createGeneratorMock } from '../../../tests/features/step_definitions/mockCreators'

import testFunctionGenerations from './testFunctionGenerations'

const simpleGenerator: FlowieExecutionDeclaration = {
  isAsync: true,
  allFunctionsNames: new Set(['generatorFunction']),
  flows: [
    { pipe: 'generatorFunction' }
  ]
}

const flowieContainer = createFlowieContainer().register(
  createGeneratorMock('generatorFunction', 'not used', ['not used'])
)

describe('generators.generateFunctionFromFlowDeclaration', function () {
  it(
    'run through a iterator generate from generator',
    testFunctionGenerations('simpleGenerator', simpleGenerator, flowieContainer)
  )
})
