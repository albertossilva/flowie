const flowieResult: CreateFlowieResult = {
  // fail<ResultType = null> (error: Error): FlowResult<ResultType> {
  //   return {
  //     success: false,
  //     error,
  //     lastResult: null,
  //     executionTime: 0,
  //     functions: { }
  //   }
  // },

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
  // readonly fail: <ResultType = null>(error: Error) => FlowResult<ResultType>
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
