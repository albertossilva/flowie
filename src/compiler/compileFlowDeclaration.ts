import { FlowieExecutionDeclaration } from '../types'
import { FlowieContainer } from '../container/createFlowieContainer'
import flowieResult from '../runtime/flowieResult'

import generateFunctionFromFlowDeclaration from './generateFunctionFromFlowDeclaration'

export default function compileFlowDeclaration<Argument, Result> (
  flowieDeclaration: FlowieExecutionDeclaration,
  flowieContainer: FlowieContainer
) {
  const { generatedFlowFunction } = generateFunctionFromFlowDeclaration<Argument, Result>(
    flowieDeclaration,
    flowieContainer
  )

  return function executeCompiledFlow (argument: Argument) {
    return generatedFlowFunction({ flowieContainer, argument, createFlowieResult: flowieResult })
  }
}
