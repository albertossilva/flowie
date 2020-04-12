import createDebugger from 'debug'

import { PreparedFlowieExecution } from '../prepared.types'
import { FlowieContainer } from '../container/createFlowieContainer'
import flowieResult from '../runtime/flowieResult'

import generateFunctionFromFlowDeclaration from './generateFunctionFromFlowDeclaration'

const debug = createDebugger('flowie:compiler')

export default function compileFlowDeclaration<Argument, Result, Context> (
  preparedFlowieManager: PreparedFlowieExecution,
  flowieContainer: FlowieContainer
) {
  const { generatedFlowFunction, generatedFlowFunctionWithContext } =
    generateFunctionFromFlowDeclaration<Argument, Result, Context>(preparedFlowieManager, flowieContainer)
  debug('Flowie compiled')

  const executeMainFlow = generatedFlowFunction()
  const executeMainFlowWithContext = generatedFlowFunctionWithContext()

  return function executeCompiledFlow (argument: Argument, context?: Context) {
    if (context === undefined) {
      return executeMainFlow({ flowieContainer, argument, createFlowieResult: flowieResult })
    }

    return executeMainFlowWithContext({ flowieContainer, argument, createFlowieResult: flowieResult, context })
  }
}
