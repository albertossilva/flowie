import { FlowDeclaration } from '../types'
import { FlowieContainer } from '../container/createFlowieContainer'
import flowieResult from '../flowieResult'

import generateFunctionFromFlowDeclaration from './generateFunctionFromFlowDeclaration'

export default function compileFlowDeclaration<Argument, Result> (flowDeclaration: FlowDeclaration) {
  const { generatedFlowFunction } = generateFunctionFromFlowDeclaration<Argument, Result>(flowDeclaration)

  return function executeCompiledFlow (flowieContainer: FlowieContainer, argument: Argument) {
    return generatedFlowFunction({ flowieContainer, argument, createFlowieResult: flowieResult })
  }
}
