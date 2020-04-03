import { FlowieContainer } from '../container/createFlowieContainer'
import { FlowResult, CreateFlowieResult } from '../runtime/flowieResult'

import functionConstructors from '../functionConstructors'
import { FlowieExecutionDeclaration } from '../types'

import generateFlowFunction from './dot/generateFlowFunction'

export default function generateFunctionFromFlowDeclaration<Argument, Result> (
  flowieDeclaration: FlowieExecutionDeclaration,
  flowieContainer: FlowieContainer
): FlowFunctionGeneration<Argument, Result> {
  const functionDescriptorsTuplesList = flowieDeclaration.allFunctionsNames.toJS()
    .map(createDescriptor, { flowieContainer })

  const sourceCode = generateFlowFunction({
    functionDescriptorsList: Object.fromEntries(functionDescriptorsTuplesList),
    flows: flowieDeclaration.flows
  })

  const Constructor = flowieDeclaration.isAsync ? functionConstructors.async : functionConstructors.sync

  // sourceCode.split(';').join('\n') // in order to Debug

  const generatedFlowFunction = new Constructor('executionArguments', sourceCode)
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

function createDescriptor (this: { readonly flowieContainer: FlowieContainer }, functionName: string) {
  return [functionName, {
    name: functionName,
    isAsync: this.flowieContainer.functionsContainer[functionName].isAsync
  }]
}

interface ExecutionArguments<Argument> {
  readonly flowieContainer: FlowieContainer
  readonly argument: Argument
  readonly createFlowieResult: CreateFlowieResult
}
