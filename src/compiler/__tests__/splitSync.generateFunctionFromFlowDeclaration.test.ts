import createFlowieContainer from '../../container/createFlowieContainer'
import { FlowieExecutionDeclaration } from '../../types'

import { createMock, createAsyncMock } from '../../../tests/features/step_definitions/mockCreators'
import testFunctionGenerations from './testFunctionGenerations'

const splitAsyncFunctionList: FlowieExecutionDeclaration = {
  isAsync: true,
  allFunctionsNames: new Set(['splitOne', 'splitTwo']),
  flows: [
    { split: ['splitOne', 'splitTwo'] }
  ]
}

const flowieContainer = createFlowieContainer().register(
  createAsyncMock('splitOne', 'not used', 'not used'),
  createMock('splitTwo', 'not used', 'not used')
)

describe('pipeSync.generateFunctionFromFlowDeclaration', function () {
  it(
    'generates sync function when there is no async function pipe',
    testFunctionGenerations('splitAsyncFunctionList', splitAsyncFunctionList, flowieContainer)
  )
})
