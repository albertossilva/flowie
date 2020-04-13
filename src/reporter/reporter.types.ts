export default interface Reporter<Argument, Result, Context> {
  readonly reportFunctionCall: (
    functionToCall: (argument: Argument) => Result,
    functionNameToReport: string,
    argument: Argument
  ) => readonly [FunctionReport, Result]

  readonly reportAsyncFunctionCall: (
    functionToCall: (argument: Argument) => Result,
    functionNameToReport: string,
    argument: Argument,
    context: Context
  ) => Promise<readonly [FunctionReport, Result]>

  readonly reportFunctionCallContext: (
    functionToCall: (argument: Argument, context: Context) => Result,
    functionNameToReport: string,
    argument: Argument
  ) => readonly [FunctionReport, Result]

  readonly reportAsyncFunctionCallContext: (
    functionToCall: (argument: Argument, context: Context) => Result,
    functionNameToReport: string,
    argument: Argument,
    context: Context
  ) => Promise<readonly [FunctionReport, Result]>
}

export interface FunctionReport {
  readonly functionName: string
  readonly executionTime: number
}
