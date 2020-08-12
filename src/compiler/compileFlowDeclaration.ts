import createDebugger from 'debug'

import { PreparedFlowieExecution } from '../prepared.types'
import { FlowieContainer } from '../container/createFlowieContainer'
import flowieResult, { FlowExecutionResult } from '../runtime/flowieResult'

import generateFunctionFromFlowDeclaration from './generateFunctionFromFlowDeclaration'
import Reporter, { FunctionReport } from '../reporter/reporter.types'

const debug = createDebugger('flowie:compiler')

export default function compileFlowDeclaration<Argument, Result, Context> (
  preparedFlowieManager: PreparedFlowieExecution,
  flowieContainer: FlowieContainer
): (reporter: Reporter<any, any, any>, argument: Argument, context?: Context) => FlowExecutionResult<Result> {
  const { generatedFlowFunction, generatedFlowFunctionWithContext } =
    generateFunctionFromFlowDeclaration<Argument, Result, Context>(preparedFlowieManager, flowieContainer)
  debug('Flowie compiled')

  const executeMainFlow = generatedFlowFunction(separateReportListFromResult)
  const executeMainFlowWithContext = generatedFlowFunctionWithContext(separateReportListFromResult)

  return function executeCompiledFlow (
    reporter: Reporter<any, any, any>,
    argument: Argument,
    context?: Context
  ): FlowExecutionResult<Result> {
    const executionArguments = { flowieContainer, argument, flowieResult, reporter }
    if (context === undefined) {
      return executeMainFlow(executionArguments)
    }

    return executeMainFlowWithContext({ ...executionArguments, context })
  }
}

function separateReportListFromResult (listToConcatenate: ReadonlyArray<(readonly [FunctionReport, any])>) {
  const emptyFunctionReportList: ReadonlyArray<FunctionReport> = []
  const emptyResultList: ReadonlyArray<any> = []
  return listToConcatenate.reduce(concatenateReportListAndResult, [emptyFunctionReportList, emptyResultList])
}

function concatenateReportListAndResult (
  [functionReportList, resultList]: readonly [ReadonlyArray<FunctionReport>, ReadonlyArray<any>],
  [functionReport, result]: readonly [FunctionReport, any]
): readonly [ReadonlyArray<FunctionReport>, ReadonlyArray<any>] {
  return [
    functionReportList.concat(functionReport),
    resultList.concat(result)
  ]
}
