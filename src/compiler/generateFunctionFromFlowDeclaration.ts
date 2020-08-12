import debug from 'debug'

import { FlowieContainer } from '../container/createFlowieContainer'
import { FlowResult, CreateFlowieResult } from '../runtime/flowieResult'
import Reporter from '../reporter/reporter.types'

import FunctionConstructor from '../functionConstructors'
import { PreparedFlowieExecution } from '../prepared.types'

import generateFlowFunction from './dot/generateFlowFunction'
import generateFlow from './dot/generateFlow'

import formatCode from './formatCode'

import convertFlowDeclarationToRunnableDeclaration, { Step } from './convertFlowDeclarationToRunnableDeclaration'

export default function generateFunctionFromFlowDeclaration<Argument, Result, Context> (
  preparedFlowieExecution: PreparedFlowieExecution,
  flowieContainer: FlowieContainer
): FlowFunctionGeneration<Argument, Result, Context> {
  const runnableDeclaration = convertFlowDeclarationToRunnableDeclaration(
    preparedFlowieExecution,
    flowieContainer.isAsyncFunction,
    flowieContainer.isGeneratorFunction
  )

  const generationOptions = {
    ...runnableDeclaration,
    generateFlow (
      it: Record<string, unknown>,
      options: {
        readonly step: Step,
        readonly parentIndex: number,
        readonly hasGenerators: boolean,
        readonly includeContext: boolean
      }
    ) {
      return generateFlow({ ...it, ...options })
    }
  }

  const shouldDebugFlow = debug.enabled('debugFlowie')
  const sourceCode = generateFlowFunction({ ...generationOptions, includeContext: false, shouldDebugFlow })
  const sourceCodeWithContext = generateFlowFunction({ ...generationOptions, includeContext: true, shouldDebugFlow })

  const finalSourceCode = formatCode(sourceCode, shouldDebugFlow)
  const finalSourceCodeWithContext = formatCode(sourceCodeWithContext, shouldDebugFlow)

  const generatedFlowFunction = new FunctionConstructor('separateReportListFromResult', finalSourceCode) as
    GeneratedFlowFunction<Argument, Result>
  const generatedFlowFunctionWithContext =
    new FunctionConstructor('separateReportListFromResult', finalSourceCodeWithContext) as
    GeneratedFlowFunctionForContext<Argument, Result, Context>

  return { generatedFlowFunction, generatedFlowFunctionWithContext }
}

export interface FlowFunctionGeneration<Argument, Result, Context> {
  readonly generatedFlowFunction: GeneratedFlowFunction<Argument, Result>
  readonly generatedFlowFunctionWithContext: GeneratedFlowFunctionForContext<Argument, Result, Context>
}

export interface GeneratedFlowFunction<Argument, Result> {
  (separateReportListFromResult: SeparateReportListFromResult):
    (executionArguments: ExecutionArguments<Argument, Result>) => FlowResult<Result> | Promise<FlowResult<Result>>
}

export interface GeneratedFlowFunctionForContext<Argument, Result, Context> {
  (separateReportListFromResult: SeparateReportListFromResult):
    (executionArguments: ExecutionArgumentsForContext<Argument, Result, Context>) =>
      FlowResult<Result> | Promise<FlowResult<Result>>
}

export interface SeparateReportListFromResult {
  (listToConcatenate: ReadonlyArray<readonly [unknown, any]>): readonly [ReadonlyArray<unknown>, ReadonlyArray<any>]
}

interface ExecutionArguments<Argument, Result> {
  readonly flowieContainer: FlowieContainer
  readonly argument: Argument
  readonly flowieResult: CreateFlowieResult
  readonly reporter: Reporter<Argument, Result, any>
}

interface ExecutionArgumentsForContext<Argument, Result, Context> extends ExecutionArguments<Argument, Result> {
  readonly context: Context
}
