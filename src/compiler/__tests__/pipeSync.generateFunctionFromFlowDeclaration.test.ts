import createFlowieContainer from '../../container/createFlowieContainer'
import { PreparedFlowieExecution } from '../../prepared.types'

import { createMock } from '../../../tests/features/step_definitions/mockCreators'

import testFunctionGenerations from './testFunctionGenerations'

const pipeOneSyncFunction: PreparedFlowieExecution = {
  isAsync: false,
  allFunctionsNames: new Set(['firstFlowieItem']),
  flows: [{ pipe: 'firstFlowieItem' }]
}

const pipeSyncFunctionList: PreparedFlowieExecution = {
  isAsync: false,
  allFunctionsNames: new Set(['firstFlowieItem', 'secondFlowieItem', 'thirdFlowieItem']),
  flows: [
    { pipe: 'firstFlowieItem' },
    { pipe: 'secondFlowieItem' },
    { pipe: 'thirdFlowieItem' }
  ]
}

const flowieContainer = createFlowieContainer().register(
  createMock('firstFlowieItem', 'not used', 'not used'),
  createMock('secondFlowieItem', 'not used', 'not used'),
  createMock('thirdFlowieItem', 'not used', 'not used')
)

describe('pipeSync.generateFunctionFromFlowDeclaration', function () {
  it(
    'generates sync function when there is no async function pipe',
    testFunctionGenerations('pipeOneSyncFunction', pipeOneSyncFunction, flowieContainer)
  )

  it(
    'generates sync function when there is no async function when piping more functions',
    testFunctionGenerations('pipeSyncFunctionList', pipeSyncFunctionList, flowieContainer)
  )
})
