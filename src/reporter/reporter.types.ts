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

  readonly startGeneratorReport: (functionName: string) => GeneratorReporter
}

export interface GeneratorReporter {
  readonly next: () => GeneratorReporter
  readonly report: GeneratorReport
}

export interface FunctionReport {
  readonly functionName: string
  readonly executionTime: number
}

export interface GeneratorReport {
  readonly functionName: string
  readonly hrTime: HRTime
  readonly iterationTime: number
}

export type HRTime = readonly [seconds, nanoSeconds]
type seconds = number
type nanoSeconds = number

export type FlowFunctionsResultList = Readonly<Record<string, FlowFunctionResult>>

export interface FlowFunctionResult {
  readonly calls: number
  readonly slowestExecutionTime: number
  readonly averageExecutionTime: number
  readonly fastestExecutionTime: number
  readonly totalExecutionTime: number
  readonly iterations?: {
    readonly count: number
    readonly slowestIterationTime: number
    readonly averageIterationTime: number
    readonly fastestIterationTime: number
    readonly totalIterationTime: number
  }
}
