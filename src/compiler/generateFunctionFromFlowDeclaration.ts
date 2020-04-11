import { FlowieContainer } from '../container/createFlowieContainer'
import { FlowResult, CreateFlowieResult } from '../runtime/flowieResult'

import FunctionConstructor from '../functionConstructors'
import { PreparedFlowieExecution } from '../prepared.types'

import generateFlowFunction from './dot/generateFlowFunction'
import generateFlow from './dot/generateFlow'

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
      it: Function,
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

  const sourceCode = generateFlowFunction({ ...generationOptions, includeContext: false })
  const sourceCodeWithContext = generateFlowFunction({ ...generationOptions, includeContext: true })

  // console.log(sourceCode.split(';').join(';\n').split('{').join('{\n').split('}').join('\n}')) //  to debug
  const generatedFlowFunction = new FunctionConstructor(sourceCode) as GeneratedFlowFunction<Argument, Result>
  const generatedFlowFunctionWithContext =
    new FunctionConstructor(sourceCodeWithContext) as GeneratedFlowFunctionForContext<Argument, Result, Context>

  return { generatedFlowFunction, generatedFlowFunctionWithContext }
}

export interface FlowFunctionGeneration<Argument, Result, Context> {
  readonly generatedFlowFunction: GeneratedFlowFunction<Argument, Result>
  readonly generatedFlowFunctionWithContext: GeneratedFlowFunctionForContext<Argument, Result, Context>
}

export interface GeneratedFlowFunction<Argument, Result> {
  (): (executionArguments: ExecutionArguments<Argument>) => FlowResult<Result> | Promise<FlowResult<Result>>
}

export interface GeneratedFlowFunctionForContext<Argument, Result, Context> {
  (): (executionArguments: ExecutionArgumentsForContext<Argument, Context>) =>
    FlowResult<Result> | Promise<FlowResult<Result>>
}

interface ExecutionArguments<Argument> {
  readonly flowieContainer: FlowieContainer
  readonly argument: Argument
  readonly createFlowieResult: CreateFlowieResult
}

interface ExecutionArgumentsForContext<Argument, Context> extends ExecutionArguments<Argument> {
  readonly context: Context
}
