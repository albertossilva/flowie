import { FunctionReport } from './reporter.types'

export function reportFunctionCall <Argument, Result> (
  functionToCall: (argument: Argument) => Result,
  functionNameToReport: string,
  argument: Argument
): readonly [FunctionReport, Result] {
  const loadNanoSeconds = process.hrtime()

  const result = functionToCall(argument)
  const diffNanoseconds = process.hrtime(loadNanoSeconds)
  const executionTime = (diffNanoseconds[0] / 1000) + (diffNanoseconds[1] / 1000000)

  return [{ functionName: functionNameToReport, executionTime }, result]
}

export async function reportAsyncFunctionCall <Argument, Result> (
  functionToCall: (argument: Argument) => Promise<Result>,
  functionNameToReport: string,
  argument: Argument
): Promise<readonly [FunctionReport, Result]> {
  const loadNanoSeconds = process.hrtime()

  const result = await functionToCall(argument)
  const diffNanoseconds = process.hrtime(loadNanoSeconds)
  const executionTime = (diffNanoseconds[0] / 1000) + (diffNanoseconds[1] / 1000000)

  return [{ functionName: functionNameToReport, executionTime }, result]
}

export function reportFunctionCallContext<Argument, Result, Context> (
  functionToCall: (argument: Argument, context?: Context) => Result,
  functionNameToReport: string,
  argument: Argument,
  context?: Context
): readonly [FunctionReport, Result] {
  const loadNanoSeconds = process.hrtime()

  const result = functionToCall(argument, context)
  const diffNanoseconds = process.hrtime(loadNanoSeconds)
  const executionTime = (diffNanoseconds[0] / 1000) + (diffNanoseconds[1] / 1000000)

  return [{ functionName: functionNameToReport, executionTime }, result]
}

export async function reportAsyncFunctionCallContext<Argument, Result, Context> (
  functionToCall: (argument: Argument, context?: Context) => Promise<Result>,
  functionNameToReport: string,
  argument: Argument,
  context?: Context
): Promise<readonly [FunctionReport, Result]> {
  const loadNanoSeconds = process.hrtime()

  const result = await functionToCall(argument, context)
  const diffNanoseconds = process.hrtime(loadNanoSeconds)
  const executionTime = (diffNanoseconds[0] / 1000) + (diffNanoseconds[1] / 1000000)

  return [{ functionName: functionNameToReport, executionTime }, result]
}
