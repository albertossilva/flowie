import { Set as ImmutableSet } from 'immutable'
import testFunctionGenerations from './testFunctionGenerations'
import createFlowieContainer from '../../container/createFlowieContainer'
import { createMock } from '../../../tests/features/step_definitions/mockCreators'

const pipeOneSyncFunction = {
  isAsync: false,
  allFunctionsNames: ImmutableSet(['firstFlowieItem']),
  flows: [
    { pipe: { function: 'firstFlowieItem' } }
  ]
}

const pipeMoreThanOneSyncFunction = {
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
    'generates no async function when there is one async function pipe',
    testFunctionGenerations('pipeOneSyncFunction', pipeOneSyncFunction, flowieContainer)
  )

  it(
    'generates no async function when there for more than one sync function',
    testFunctionGenerations('pipeMoreThanOneSyncFunction', pipeMoreThanOneSyncFunction, flowieContainer)
  )
})
