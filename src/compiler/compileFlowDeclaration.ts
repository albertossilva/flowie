import { FlowieExecutionDeclaration } from '../types'
import { FlowieContainer } from '../container/createFlowieContainer'
import flowieResult from '../runtime/flowieResult'

import generateFunctionFromFlowDeclaration from './generateFunctionFromFlowDeclaration'

export default function compileFlowDeclaration<Argument, Result> (flowieDeclaration: FlowieExecutionDeclaration) {
  const { generatedFlowFunction } = generateFunctionFromFlowDeclaration<Argument, Result>(flowieDeclaration)

  return function executeCompiledFlow (flowieContainer: FlowieContainer, argument: Argument) {
    return generatedFlowFunction({ flowieContainer, argument, createFlowieResult: flowieResult })
  }
}
