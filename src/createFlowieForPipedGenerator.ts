import { asyncGenSequence } from 'gensequence'

import {
  FlowFunction,
  Flowie,
  RootFlowieCreator,
  GeneratorFlowFunction,
  FlowResult,
  FlowieExtender,
  FlowItem
  // GeneratorFlowFunction
} from './flowie.type'
import { markAsFlowieFunction } from './flowieFunctionSymbol'
import flowieResult from './flowieResult'
import createGeneratorPipeFlow from './createGeneratorPipeFlow'
import convertFlowItemToFlowFunction from './convertFlowItemToFlowFunction'

export default function createFlowieForPipedGenerator<Argument, Result, IntermediateResult, InitialArgument = Argument> (
  flowFunctionGenerator: GeneratorFlowFunction<IntermediateResult, Result>,
  previousFlowFunction: FlowFunction<Argument, IntermediateResult>,
  createFlowieRecursion: RootFlowieCreator
): Flowie<Argument, Result, InitialArgument> {
  async function executeFlow (parameter: InitialArgument): Promise<FlowResult<Result>> {
    const startTime = Date.now()
    const parameterForFirstFunction = parameter as any as Argument

    const intermediateResult = await previousFlowFunction(parameterForFirstFunction) as IntermediateResult

    const generator = flowFunctionGenerator(intermediateResult) as AsyncGenerator<Result, void>
    const lastResults = await asyncGenSequence(generator).reduceAsync(getLastResultFromGenerator, null)
    return flowieResult.success(lastResults, startTime, {})
  }

  function pipe<NewResult> (nextFlowItem: FlowItem<Result, NewResult>): Flowie<Result, NewResult, InitialArgument> {
    const nextFlowFunction = convertFlowItemToFlowFunction(nextFlowItem)
    const pipeGeneratorFlowItem = createGeneratorPipeFlow(flowFunctionGenerator, nextFlowFunction)
    return createFlowieRecursion(pipeGeneratorFlowItem)
  }
  function split<NewResult> (
    ...nextFlowItemsList: readonly FlowItem<Result, NewResult, InitialArgument>[]
  ): Flowie<Result, any, InitialArgument> {
  //   // const nextFlowFunctionsList = nextFlowItemsList.map(convertFlowItemToFlowFunction)
  //   // console.log(nextFlowFunctionsList)
  //   // const splittedFlowItem = createSplitFlow(nextFlowFunctionsList, flowFunction)
  //   // // return createFlowieRecursion(splittedFlowItem)
    return null as any
  }
  const flowieExtender: FlowieExtender<Argument, Result, InitialArgument> = { pipe, split }

  // eslint-disable-next-line functional/immutable-data
  return markAsFlowieFunction(Object.assign(executeFlow, flowieExtender), flowFunctionGenerator)
}

async function getLastResultFromGenerator<Result> (_result: Result, nextResult: Result) {
  return nextResult
}
