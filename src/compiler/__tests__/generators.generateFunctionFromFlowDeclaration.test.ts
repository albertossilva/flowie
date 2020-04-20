import createFlowieContainer from '../../container/createFlowieContainer'
import { PreparedFlowieExecution } from '../../prepared.types'

import {
  createGeneratorMock,
  createAsyncGeneratorMock,
  createMock
} from '../../../tests/features/step_definitions/mockCreators'

import testFunctionGenerations from './testFunctionGenerations'

const simpleGenerator: PreparedFlowieExecution = {
  isAsync: false,
  allFunctionsNames: new Set(['generatorFunction']),
  flows: [
    { pipe: 'generatorFunction' }
  ]
}

const asyncGeneratorOnSubFlow: PreparedFlowieExecution = {
  isAsync: true,
  allFunctionsNames: new Set(['generatorFunction']),
  flows: [
    { flows: [{ pipe: 'generatorFunction' }], name: 'syncGeneratorFlow' },
    { flows: [{ pipe: 'asyncGeneratorFunction' }], name: 'subAsyncGeneratorFlow' },
    { pipe: 'otherFunction' }
  ]
}

const splitGeneratorOnSubFlow: PreparedFlowieExecution = {
  isAsync: true,
  allFunctionsNames: new Set(['generatorFunction']),
  flows: [
    { split: ['generatorFunction'], name: 'syncGeneratorFlow' },
    { flows: [{ pipe: 'asyncGeneratorFunction' }], name: 'subAsyncGeneratorFlow' },
    { pipe: 'otherFunction' }
  ]
}

const flowieContainer = createFlowieContainer().register(
  createMock('otherFunction', 'not used', 'not used'),
  createGeneratorMock('generatorFunction', 'not used', ['not used']),
  createAsyncGeneratorMock('asyncGeneratorFunction', 'not used', ['not used'])
)

describe('generators.generateFunctionFromFlowDeclaration', function () {
  it(
    'run through a iterator generate from generator',
    testFunctionGenerations('simpleGenerator', simpleGenerator, flowieContainer)
  )

  it(
    'create an async function returning the last yield from a generator in as subFlow',
    testFunctionGenerations('asyncGeneratorOnSubFlow', asyncGeneratorOnSubFlow, flowieContainer)
  )

  it(
    'generates a subFlow for generators in split',
    testFunctionGenerations('splitGeneratorOnSubFlow', splitGeneratorOnSubFlow, flowieContainer)
  )
})
