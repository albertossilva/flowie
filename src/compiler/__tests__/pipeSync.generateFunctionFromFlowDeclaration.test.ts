import { Set as ImmutableSet } from 'immutable'
import createFlowieContainer from '../../container/createFlowieContainer'
import { createMock } from '../../../tests/features/step_definitions/mockCreators'
import { syncConstructor } from '../../functionConstructors'

import testFunctionGenerations from './testFunctionGenerations'

const pipeOneSyncFunction = {
  isAsync: false,
  allFunctionsNames: ImmutableSet(['firstFlowieItem']),
  flows: [
    { pipe: { function: 'firstFlowieItem' } }
  ]
}

const pipeSyncFunctionList = {
  isAsync: false,
  allFunctionsNames: ImmutableSet(['firstFlowieItem', 'secondFlowieItem', 'thirdFlowieItem']),
  flows: [
    { pipe: { function: 'firstFlowieItem' } },
    { pipe: { function: 'secondFlowieItem' } },
    { pipe: { function: 'thirdFlowieItem' } }
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
    testFunctionGenerations('pipeOneSyncFunction', pipeOneSyncFunction, flowieContainer, syncConstructor)
  )

  it(
    'generates sync function when there is no async function when piping more functions',
    testFunctionGenerations('pipeSyncFunctionList', pipeSyncFunctionList, flowieContainer, syncConstructor)
  )
})
