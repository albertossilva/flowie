import { FlowieContainer } from '../container/createFlowieContainer'
import { FlowResult, CreateFlowieResult } from '../runtime/flowieResult'

import FunctionConstructor from '../functionConstructors'
import { FlowieExecutionDeclaration } from '../types'

import generateFlowFunction from './dot/generateFlowFunction'
import generateFlow from './dot/generateFlow'

import convertFlowDeclarationToRunnableDeclaration, { Step } from './convertFlowDeclarationToRunnableDeclaration'

export default function generateFunctionFromFlowDeclaration<Argument, Result> (
  flowieDeclaration: FlowieExecutionDeclaration,
  flowieContainer: FlowieContainer
): FlowFunctionGeneration<Argument, Result> {
  const runnableDeclaration = convertFlowDeclarationToRunnableDeclaration(
    flowieDeclaration,
    flowieContainer.isAsyncFunction,
    flowieContainer.isGeneratorFunction
  )

  const sourceCode = generateFlowFunction({
    ...runnableDeclaration,
    generateFlow (
      it: any,
      options: { readonly step: Step, readonly parentIndex: number, readonly hasGenerators: boolean }
    ) {
      return generateFlow({ ...it, ...options })
    }
  })

  // console.log(sourceCode.split(';').join(';\n').split('{').join('{\n').split('}').join('\n}')) //  to debug
  const generatedFlowFunction = new FunctionConstructor(sourceCode)
  return {
    generatedFlowFunction: generatedFlowFunction as GeneratedFlowFunction<Argument, Result>
  }
}

export interface FlowFunctionGeneration<Argument, Result> {
  readonly generatedFlowFunction: GeneratedFlowFunction<Argument, Result>
}

export interface GeneratedFlowFunction<Argument, Result> {
  (): (executionArguments: ExecutionArguments<Argument>) => FlowResult<Result> | Promise<FlowResult<Result>>
}

interface ExecutionArguments<Argument> {
  readonly flowieContainer: FlowieContainer
  readonly argument: Argument
  readonly createFlowieResult: CreateFlowieResult
}
