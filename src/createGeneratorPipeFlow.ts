import { asyncGenSequence, genSequence } from 'gensequence'

import { FlowFunction, GeneratorFlowFunction } from './flowie.type'
import { ThenArg } from 'gensequence/dist/types'

export default function createGeneratorPipeFlow<Argument, Result, NewResult> (
  previousFlowFunction: GeneratorFlowFunction<Argument, Result>,
  flowFunction: FlowFunction<Result, NewResult>
) {
  const createExecutePipeFlow = previousFlowFunction[Symbol.toStringTag] === 'GeneratorFunction'
    ? createPipeExecuteFlowForSyncGenerator
    : createPipeExecuteFlowForAsyncGenerator

  return createExecutePipeFlow(previousFlowFunction, flowFunction) as FlowFunction<Argument, NewResult>
}

function createPipeExecuteFlowForAsyncGenerator<Argument, Result, NewResult> (
  previousFlowFunction: GeneratorFlowFunction<Argument, Result>,
  flowFunction: FlowFunction<Result, NewResult>
) {
  return async function executeGeneratorPipeFlow (argument: Argument): Promise<NewResult> {
    const generator = previousFlowFunction(argument) as AsyncGenerator<Result, void>
    const lastExecution = await asyncGenSequence(generator).reduceAsync(
      getLastResultFromGenerator,
      { flowFunction, result: null as NewResult }
    )
    return lastExecution.result
  }
}

function createPipeExecuteFlowForSyncGenerator<Argument, Result, NewResult> (
  previousFlowFunction: GeneratorFlowFunction<Argument, Result>,
  flowFunction: FlowFunction<Result, NewResult>
) {
  return async function executeGeneratorPipeFlow (argument: Argument): Promise<NewResult> {
    const generator = previousFlowFunction(argument) as Generator<Result, void>
    const lastExecution = await genSequence(generator).reduceAsync(
      getLastResultFromGenerator,
      { flowFunction, result: null as NewResult }
    )
    return lastExecution.result
  }
}

async function getLastResultFromGenerator<Result, NewResult> (
  { flowFunction }: { readonly flowFunction: FlowFunction<Result, NewResult>, readonly result: NewResult },
  item: ThenArg<Result>
) {
  const result = await (flowFunction(item as Result) as any as Promise<NewResult>)
  return { result, flowFunction }
}
