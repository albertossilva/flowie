import createDebugger from 'debug'
import { HRTime, FunctionReport, GeneratorReport, FlowFunctionsResultList } from '../reporter/reporter.types'
import { calculateHRTimeDifference, compactFunctionReport } from '../reporter/reporter'

const debug = createDebugger('flowie:runtime:result')

const flowieResult: CreateFlowieResult = {
  success<ResultType = null> (
    lastResult: ResultType,
    startHRTime: HRTime,
    functionsReportList: readonly (FunctionReport | GeneratorReport)[]
  ): FlowResult<ResultType> {
    const executionTime = calculateHRTimeDifference(startHRTime)

    const initialHRTime = process.hrtime()
    const functions = compactFunctionReport(functionsReportList)
    const reportCostTime = calculateHRTimeDifference(initialHRTime)

    debug('Functions report compacted in %o', reportCostTime)

    return {
      success: true,
      lastResult,
      executionTime,
      functions
    }
  }
}

export interface CreateFlowieResult {
  readonly success: <ResultType = null>(
    lastResult: ResultType,
    startHRTime: HRTime,
    functions: readonly (FunctionReport | GeneratorReport)[]
  ) => FlowResult<ResultType>
}

export interface FlowResult<Result> {
  readonly success: boolean
  readonly error?: Error
  readonly lastResult: Result
  readonly executionTime: number
  readonly functions: FlowFunctionsResultList
}

export default flowieResult
