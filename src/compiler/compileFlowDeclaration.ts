import { PreparedFlowieExecution } from '../prepared.types'
import { FlowieContainer } from '../container/createFlowieContainer'
import flowieResult from '../runtime/flowieResult'

import generateFunctionFromFlowDeclaration from './generateFunctionFromFlowDeclaration'

export default function compileFlowDeclaration<Argument, Result> (
  preparedFlowieManager: PreparedFlowieExecution,
  flowieContainer: FlowieContainer
) {
  const { generatedFlowFunction } = generateFunctionFromFlowDeclaration<Argument, Result>(
    preparedFlowieManager,
    flowieContainer
  )

  const executeMainFlow = generatedFlowFunction()

  return function executeCompiledFlow (argument: Argument) {
    return executeMainFlow({ flowieContainer, argument, createFlowieResult: flowieResult })
  }
}
