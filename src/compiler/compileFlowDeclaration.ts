import createDebugger from 'debug'

import { PreparedFlowieExecution } from '../prepared.types'
import { FlowieContainer } from '../container/createFlowieContainer'
import flowieResult from '../runtime/flowieResult'

import generateFunctionFromFlowDeclaration from './generateFunctionFromFlowDeclaration'
import Reporter, { FunctionReport } from '../reporter/reporter.types'

const debug = createDebugger('flowie:compiler')

export default function compileFlowDeclaration<Argument, Result, Context> (
  preparedFlowieManager: PreparedFlowieExecution,
  flowieContainer: FlowieContainer
) {
  const { generatedFlowFunction, generatedFlowFunctionWithContext } =
    generateFunctionFromFlowDeclaration<Argument, Result, Context>(preparedFlowieManager, flowieContainer)
  debug('Flowie compiled')

  const executeMainFlow = generatedFlowFunction(separateReportListFromResult)
  const executeMainFlowWithContext = generatedFlowFunctionWithContext(separateReportListFromResult)

  return function executeCompiledFlow (reporter: Reporter<any, any, any>, argument: Argument, context?: Context) {
    const executionArguments = { flowieContainer, argument, flowieResult, reporter }
    if (context === undefined) {
      return executeMainFlow(executionArguments)
    }

    return executeMainFlowWithContext({ ...executionArguments, context })
  }
}

function separateReportListFromResult (listToConcatenate: readonly (readonly [FunctionReport, any])[]) {
  const emptyFunctionReportList: readonly FunctionReport[] = []
  const emptyResultList: readonly any[] = []
  return listToConcatenate.reduce(concatenateReportListAndResult, [emptyFunctionReportList, emptyResultList])
}

function concatenateReportListAndResult (
  [functionReportList, resultList]: readonly [readonly FunctionReport[], readonly any[]],
  [functionReport, result]: readonly [FunctionReport, any]
): readonly [readonly FunctionReport[], readonly any[]] {
  return [
    functionReportList.concat(functionReport),
    resultList.concat(result)
  ]
}
