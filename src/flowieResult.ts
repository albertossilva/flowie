const flowieResult = {
  fail<ResultType = null> (error: Error): FlowResult<ResultType> {
    return {
      success: false,
      error,
      result: null,
      executionTime: 0,
      functions: { }
    }
  },

  success<ResultType = null> (result: ResultType, startTime: number, functions: FlowFunctionsResultList): FlowResult<ResultType> {
    return {
      success: true,
      result,
      executionTime: Date.now() - startTime,
      functions
    }
  }
}

export interface FlowResult<Result> {
  readonly success: boolean
  readonly error?: Error
  readonly result: Result
  readonly executionTime: number
  readonly functions: FlowFunctionsResultList
}

export type FlowFunctionsResultList = Readonly <Record<string, FlowFunctionResult>>

export interface FlowFunctionResult {
  readonly executionTime: number
}

export default flowieResult
