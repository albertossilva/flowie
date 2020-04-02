import { asyncGenSequence } from 'gensequence'

import {
  FlowFunction,
  FlowieCreator,
  Flowie,
  FlowItem,
  FlowieExtender,
  FlowResult,
  RootFlowieCreator,
  GeneratorFlowFunction
} from './flowie.type'
import { markAsFlowieFunction } from './flowieFunctionSymbol'
import flowieResult from './optimizedFlowie/flowieResult'
import convertFlowItemToFlowFunction from './convertFlowItemToFlowFunction'

import createGeneratorPipeFlow from './createGeneratorPipeFlow'

export default createFlowieForGenerator as FlowieCreator

function createFlowieForGenerator<Argument, Result, InitialArgument = Argument> (
  flowFunction: FlowFunction<Argument, Result>,
  createFlowieRecursion: RootFlowieCreator
): Flowie<Argument, Result, InitialArgument> {
  const flowFunctionGenerator = flowFunction as GeneratorFlowFunction<Argument, Result>

  async function executeFlow (parameter: InitialArgument): Promise<FlowResult<Result>> {
    const startTime = Date.now()
    const parameterForFirstFunction = parameter as any as Argument

    const generator = flowFunctionGenerator(parameterForFirstFunction) as AsyncGenerator<Result, void>
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
    // const nextFlowFunctionsList = nextFlowItemsList.map(convertFlowItemToFlowFunction)
    // console.log(nextFlowFunctionsList)
    // const splittedFlowItem = createSplitFlow(nextFlowFunctionsList, flowFunction)
    // // return createFlowieRecursion(splittedFlowItem)
    return null as any
  }
  const flowieExtender: FlowieExtender<Argument, Result, InitialArgument> = { pipe, split }

  // eslint-disable-next-line functional/immutable-data
  return markAsFlowieFunction(Object.assign(executeFlow, flowieExtender), flowFunction)
}

async function getLastResultFromGenerator<Result> (_result: Result, nextResult: Result) {
  return nextResult
}
