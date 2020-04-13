import createFlowieContainer from '../../container/createFlowieContainer'
import { createMock, createAsyncMock } from '../../../tests/features/step_definitions/mockCreators'

import testFunctionGenerations from './testFunctionGenerations'
import { PreparedFlowieExecution } from '../../prepared.types'

const pipeOneAsyncFunction: PreparedFlowieExecution = {
  isAsync: true,
  allFunctionsNames: new Set(['firstFlowieItem']),
  flows: [{ pipe: 'firstFlowieItem' }]
}

const pipeAsyncFunctionList: PreparedFlowieExecution = {
  isAsync: true,
  allFunctionsNames: new Set(['firstFlowieItem', 'secondFlowieItem', 'thirdFlowieItem']),
  flows: [
    { pipe: 'firstFlowieItem' },
    { pipe: 'secondFlowieItem' },
    { pipe: 'thirdFlowieItem' }
  ]
}

const flowieContainer = createFlowieContainer().register(
  createAsyncMock('firstFlowieItem', 'not used', 'not used'),
  createMock('secondFlowieItem', 'not used', 'not used'),
  createMock('thirdFlowieItem', 'not used', 'not used')
)

describe('pipeAsync.generateFunctionFromFlowDeclaration', function () {
  it(
    'generates async function when flow is async',
    testFunctionGenerations('pipeOneAsyncFunction', pipeOneAsyncFunction, flowieContainer)
  )

  it(
    'generates async function when there is one async function',
    testFunctionGenerations('pipeAsyncFunctionList', pipeAsyncFunctionList, flowieContainer)
  )
})
