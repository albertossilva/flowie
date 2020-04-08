import createFlowieContainer from '../../container/createFlowieContainer'
import { FlowieExecutionDeclaration } from '../../types'

import { createMock, createAsyncMock } from '../../../tests/features/step_definitions/mockCreators'

import testFunctionGenerations from './testFunctionGenerations'

const pipeOtherFlowFunction: FlowieExecutionDeclaration = {
  isAsync: true,
  allFunctionsNames: new Set(['firstFlowieItem', 'secondFlowieItem', 'thirdFlowieItem']),
  flows: [
    { pipe: 'firstFlowieItem' },
    {
      flows: [
        { pipe: 'secondFlowieItem' },
        {
          flows: [
            { pipe: 'thirdFlowieItem' }
          ],
          name: 'subFlowLevel2'
        }
      ],
      name: 'subFlowLevel1'
    }
  ]
}

const flowieContainer = createFlowieContainer().register(
  createMock('firstFlowieItem', 'not used', 'not used'),
  createAsyncMock('secondFlowieItem', 'not used', 'not used'),
  createMock('thirdFlowieItem', 'not used', 'not used')
)

describe('pipeFlows.generateFunctionFromFlowDeclaration', function () {
  it(
    'can pipe other flows',
    testFunctionGenerations('pipeOtherFlowFunction', pipeOtherFlowFunction, flowieContainer)
  )
})
