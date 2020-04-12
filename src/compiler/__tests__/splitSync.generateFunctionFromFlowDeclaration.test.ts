import createFlowieContainer from '../../container/createFlowieContainer'
import { PreparedFlowieExecution } from '../../prepared.types'

import { createMock, createAsyncMock } from '../../../tests/features/step_definitions/mockCreators'
import testFunctionGenerations from './testFunctionGenerations'

const splitAsyncFunctionList: PreparedFlowieExecution = {
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
    'generates an await to wait split async calls',
    testFunctionGenerations('splitAsyncFunctionList', splitAsyncFunctionList, flowieContainer)
  )
})
