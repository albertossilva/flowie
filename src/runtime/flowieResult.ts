const flowieResult: CreateFlowieResult = {
  success<ResultType = null> (
    lastResult: ResultType,
    startTime: number,
    functions: FlowFunctionsResultList
  ): FlowResult<ResultType> {
    return {
      success: true,
      lastResult,
      executionTime: Date.now() - startTime,
      functions
    }
  }
}

export interface CreateFlowieResult {
  readonly success: <ResultType = null>(
    lastResult: ResultType,
    startTime: number,
    functions: FlowFunctionsResultList
  ) => FlowResult<ResultType>
}

export interface FlowResult<Result> {
  readonly success: boolean
  readonly error?: Error
  readonly lastResult: Result
  readonly executionTime: number
  readonly functions: FlowFunctionsResultList
}

export type FlowFunctionsResultList = Readonly <Record<string, FlowFunctionResult>>

export interface FlowFunctionResult {
  readonly executionTime: number
}

export default flowieResult
