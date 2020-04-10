import createFlowieContainer from '../../container/createFlowieContainer'
import { FlowieExecutionDeclaration } from '../../types'

import {
  createGeneratorMock,
  createAsyncGeneratorMock,
  createMock
} from '../../../tests/features/step_definitions/mockCreators'

import testFunctionGenerations from './testFunctionGenerations'

const simpleGenerator: FlowieExecutionDeclaration = {
  isAsync: false,
  allFunctionsNames: new Set(['generatorFunction']),
  flows: [
    { pipe: 'generatorFunction' }
  ]
}

const asyncGeneratorOnSubFlow: FlowieExecutionDeclaration = {
  isAsync: true,
  allFunctionsNames: new Set(['generatorFunction']),
  flows: [
    { flows: [{ pipe: 'generatorFunction' }], name: 'synGeneratorFlow' },
    { flows: [{ pipe: 'asyncGeneratorFunction' }], name: 'subAsynGeneratorFlow' },
    { pipe: 'otherFunction' }
  ]
}

const splitGeneratorOnSubFlow: FlowieExecutionDeclaration = {
  isAsync: true,
  allFunctionsNames: new Set(['generatorFunction']),
  flows: [
    { split: [{ pipe: 'generatorFunction' }], name: 'synGeneratorFlow' },
    { flows: [{ pipe: 'asyncGeneratorFunction' }], name: 'subAsynGeneratorFlow' },
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
    'create an async function returning the last yield from a generator in as subflow',
    testFunctionGenerations('asyncGeneratorOnSubFlow', asyncGeneratorOnSubFlow, flowieContainer)
  )

  it(
    '',
    testFunctionGenerations('splitGeneratorOnSubFlow', splitGeneratorOnSubFlow, flowieContainer)
  )
})
