import { Set as ImmutableSet } from 'immutable'
import createFlowieContainer from '../../container/createFlowieContainer'
import { createMock, createAsyncMock } from '../../../tests/features/step_definitions/mockCreators'
import { asyncConstructor } from '../../functionConstructors'

import testFunctionGenerations from './testFunctionGenerations'

const pipeOneAsyncFunction = {
  isAsync: true,
  allFunctionsNames: ImmutableSet(['firstFlowieItem']),
  flows: [
    { pipe: { function: 'firstFlowieItem' } }
  ]
}

const pipeAsyncFunctionList = {
  isAsync: true,
  allFunctionsNames: ImmutableSet(['firstFlowieItem', 'secondFlowieItem', 'thirdFlowieItem']),
  flows: [
    { pipe: { function: 'firstFlowieItem' } },
    { pipe: { function: 'secondFlowieItem' } },
    { pipe: { function: 'thirdFlowieItem' } }
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
    testFunctionGenerations('pipeOneAsyncFunction', pipeOneAsyncFunction, flowieContainer, asyncConstructor)
  )

  it(
    'generates sync function when there is no async function when piping more functions',
    testFunctionGenerations('pipeAsyncFunctionList', pipeAsyncFunctionList, flowieContainer, asyncConstructor)
  )
})
