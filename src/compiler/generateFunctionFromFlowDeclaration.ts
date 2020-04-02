/* eslint-disable no-new-func */
import { FlowResult, CreateFlowieResult } from '../flowieResult'
import { FlowDeclaration } from '../types'
import { FlowieContainer } from '../container/createFlowieContainer'

import generateFlowFunction from './dot/generateFlowFunction'

export default function generateFunctionFromFlowDeclaration<Argument, Result> (
  flowDeclaration: FlowDeclaration
): FlowFunctionGeneration<Argument, Result> {
  const sourceCode = generateFlowFunction({ allFunctionsNames: flowDeclaration.allFunctionsNames.toJS() })
  const generatedFlowFunction = new Function('executionArguments', sourceCode)
  return {
    generatedFlowFunction: generatedFlowFunction as GeneratedFlowFunction<Argument, Result>
  }
}

export interface FlowFunctionGeneration<Argument, Result> {
  readonly generatedFlowFunction: GeneratedFlowFunction<Argument, Result>
}

export interface GeneratedFlowFunction<Argument, Result> {
  (executionArguments: ExecutionArguments<Argument>): FlowResult<Result> | Promise<FlowResult<Result>>
}

interface ExecutionArguments<Argument> {
  readonly flowieContainer: FlowieContainer
  readonly argument: Argument
  readonly createFlowieResult: CreateFlowieResult
}
