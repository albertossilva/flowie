const flowieResult: CreateFlowieResult = {
  // fail<ResultType = null> (error: Error): FlowResult<ResultType> {
  //   return {
  //     success: false,
  //     error,
  //     lastResults: null,
  //     executionTime: 0,
  //     functions: { }
  //   }
  // },

  success<ResultType = null> (
    lastResults: ResultType,
    startTime: number,
    functions: FlowFunctionsResultList
  ): FlowResult<ResultType> {
    return {
      success: true,
      lastResults,
      executionTime: Date.now() - startTime,
      functions
    }
  }
}

export interface CreateFlowieResult {
  readonly success: <ResultType = null>(
    lastResults: ResultType,
    startTime: number,
    functions: FlowFunctionsResultList
  ) => FlowResult<ResultType>
  // readonly fail: <ResultType = null>(error: Error) => FlowResult<ResultType>
}

export interface FlowResult<Result> {
  readonly success: boolean
  readonly error?: Error
  readonly lastResults: Result
  readonly executionTime: number
  readonly functions: FlowFunctionsResultList
}

export type FlowFunctionsResultList = Readonly <Record<string, FlowFunctionResult>>

export interface FlowFunctionResult {
  readonly executionTime: number
}

export default flowieResult
