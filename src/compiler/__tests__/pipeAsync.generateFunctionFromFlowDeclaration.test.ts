import createFlowieContainer from '../../container/createFlowieContainer'
import { createMock, createAsyncMock } from '../../../tests/features/step_definitions/mockCreators'

import testFunctionGenerations from './testFunctionGenerations'
import { FlowieExecutionDeclaration } from '../../types'

const pipeOneAsyncFunction: FlowieExecutionDeclaration = {
  isAsync: true,
  allFunctionsNames: new Set(['firstFlowieItem']),
  flows: [{ pipe: 'firstFlowieItem' }]
}

const pipeAsyncFunctionList: FlowieExecutionDeclaration = {
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
    'generates sync function when there is no async function pipe',
    testFunctionGenerations('pipeOneAsyncFunction', pipeOneAsyncFunction, flowieContainer)
  )

  it(
    'generates sync function when there is no async function when piping more functions',
    testFunctionGenerations('pipeAsyncFunctionList', pipeAsyncFunctionList, flowieContainer)
  )
})
