import {
  FunctionReport,
  GeneratorReporter,
  GeneratorReport,
  HRTime,
  FlowFunctionsResultList,
  FlowFunctionResult
} from './reporter.types'

export function reportFunctionCall <Argument, Result> (
  functionToCall: (argument: Argument) => Result,
  functionNameToReport: string,
  argument: Argument
): readonly [FunctionReport, Result] {
  return reportFunction(functionToCall, functionNameToReport, argument)
}

export async function reportAsyncFunctionCall <Argument, Result> (
  functionToCall: (argument: Argument) => Promise<Result>,
  functionNameToReport: string,
  argument: Argument
): Promise<readonly [FunctionReport, Result]> {
  return reportAsyncFunction(functionToCall, functionNameToReport, argument)
}

export function reportFunctionCallContext<Argument, Result, Context> (
  functionToCall: (argument: Argument, context?: Context) => Result,
  functionNameToReport: string,
  argument: Argument,
  context?: Context
): readonly [FunctionReport, Result] {
  return reportFunction(functionToCall, functionNameToReport, argument, context)
}

export async function reportAsyncFunctionCallContext<Argument, Result, Context> (
  functionToCall: (argument: Argument, context?: Context) => Promise<Result>,
  functionNameToReport: string,
  argument: Argument,
  context?: Context
): Promise<readonly [FunctionReport, Result]> {
  return reportAsyncFunction(functionToCall, functionNameToReport, argument, context)
}

export function startGeneratorReport (functionName: string): GeneratorReporter {
  return buildNextGeneratorReporter({
    functionName,
    hrTime: process.hrtime(),
    iterationTime: 0
  })
}

export function calculateHRTimeDifference (previousHRTime: HRTime): number {
  // eslint-disable-next-line functional/prefer-readonly-type
  const nextHRTime = process.hrtime(previousHRTime as [number, number])
  const differenceTime = (nextHRTime[0] / 1000) + (nextHRTime[1] / 1000000)
  return differenceTime
}

export function compactFunctionReport (
  functionsReportList: readonly (FunctionReport | GeneratorReport)[]
): FlowFunctionsResultList {
  const flowFunctionsResultList = Object.fromEntries(
    functionsReportList.reduce(collectReport, new Map<string, FlowFunctionResult>()).entries()
  )

  return flowFunctionsResultList as FlowFunctionsResultList
}

function reportFunction<Result> (
  functionToCall: Function,
  functionNameToReport: string,
  ...argumentAndContext: readonly any[]
): readonly [FunctionReport, Result] {
  const initialHRTime = process.hrtime()

  const result = functionToCall(...argumentAndContext)
  const executionTime = calculateHRTimeDifference(initialHRTime)

  return [{ functionName: functionNameToReport, executionTime }, result]
}

async function reportAsyncFunction<Result> (
  functionToCall: Function,
  functionNameToReport: string,
  ...argumentAndContext: readonly any[]
): Promise<readonly [FunctionReport, Result]> {
  const initialHRTime = process.hrtime()

  const result = await functionToCall(...argumentAndContext)
  const executionTime = calculateHRTimeDifference(initialHRTime)

  return [{ functionName: functionNameToReport, executionTime }, result]
}

function nextGeneratorReport (report: GeneratorReport) {
  const iterationTime = calculateHRTimeDifference(report.hrTime)

  return buildNextGeneratorReporter({
    functionName: report.functionName,
    hrTime: process.hrtime(),
    iterationTime
  })
}

function buildNextGeneratorReporter (report: GeneratorReport) {
  return { report, next: nextGeneratorReport.bind(null, report) }
}

function collectReport (
  // perfomance issue
  // eslint-disable-next-line functional/prefer-readonly-type
  functionsReport: Map<string, FlowFunctionResult>,
  report: FunctionReport | GeneratorReport
): ReadonlyMap<string, FlowFunctionResult> {
  if (!functionsReport.has(report.functionName)) {
    functionsReport.set(report.functionName, emptyFunctionCallReport)
  }
  const savedReport = functionsReport.get(report.functionName)
  const functionReport = report as FunctionReport

  if ('executionTime' in functionReport) {
    return functionsReport.set(report.functionName, collectFunctionCall(savedReport, functionReport))
  }

  const generatorReport = report as GeneratorReport

  return functionsReport.set(report.functionName, collectIterationReport(savedReport, generatorReport))
}

function collectIterationReport (savedReport: FlowFunctionResult, generatorReport: GeneratorReport) {
  const savedIterations = savedReport.iterations || emptyIterationReport
  const count = savedIterations.count + 1
  const totalIterationTime = savedIterations.totalIterationTime + generatorReport.iterationTime
  const iterations = {
    count,
    slowestIterationTime: Math.max(savedIterations.slowestIterationTime, generatorReport.iterationTime),
    averageIterationTime: totalIterationTime / count,
    fastestIterationTime: Math.min(savedIterations.fastestIterationTime, generatorReport.iterationTime),
    totalIterationTime
  }
  return Object.assign({}, savedReport, { iterations })
}

function collectFunctionCall (savedReport: FlowFunctionResult, functionReport: FunctionReport) {
  const totalExecutionTime = savedReport.totalExecutionTime + functionReport.executionTime
  const calls = savedReport.calls + 1

  return Object.assign({
    calls,
    slowestExecutionTime: Math.max(savedReport.slowestExecutionTime, functionReport.executionTime),
    averageExecutionTime: totalExecutionTime / calls,
    fastestExecutionTime: Math.min(savedReport.fastestExecutionTime, functionReport.executionTime),
    totalExecutionTime
  }, savedReport.iterations ? { iterations: savedReport.iterations } : {})
}

const emptyFunctionCallReport = {
  calls: 0,
  slowestExecutionTime: 0,
  averageExecutionTime: 0,
  fastestExecutionTime: Infinity,
  totalExecutionTime: 0
}

const emptyIterationReport = {
  count: 0,
  slowestIterationTime: 0,
  averageIterationTime: 0,
  fastestIterationTime: Infinity,
  totalIterationTime: 0
}
