import {
  FlowFunction,
  Flowie,
  FlowItem,
  FlowieExtender,
  FlowResult,
  RootFlowieCreator,
  FlowieCreator
  // GeneratorFlowFunction
} from './flowie.type'
import createPipeFlow from './createPipeFlow'
import createSplitFlow from './createSplitFlow'
import flowieResult from './optimizedFlowie/flowieResult'
import convertFlowItemToFlowFunction from './convertFlowItemToFlowFunction'
// import createFlowieForPipedGenerator from './createFlowieForPipedGenerator'
import { markAsFlowieFunction } from './flowieFunctionSymbol'

export default createFlowieForSimpleFunction as FlowieCreator

function createFlowieForSimpleFunction<Argument, Result, InitialArgument = Argument> (
  flowFunction: FlowFunction<Argument, Result>,
  createFlowieRecursion: RootFlowieCreator
): Flowie<Argument, Result, InitialArgument> {
  const executeFlow = flowFunction[Symbol.toStringTag] === 'AsyncFunction'
    ? createAsyncExecuteFlowFunction(flowFunction) : createExecuteFlowFunction(flowFunction)

  function pipe<NewResult> (nextFlowItem: FlowItem<Result, NewResult>): Flowie<Result, NewResult, InitialArgument> {
    const nextFlowFunction = convertFlowItemToFlowFunction(nextFlowItem)

    // const isGenerator = ['GeneratorFunction', 'AsyncGeneratorFunction'].includes(nextFlowFunction[Symbol.toStringTag])
    // if (isGenerator) {
    //   return createFlowieForPipedGenerator(
    //     nextFlowFunction as GeneratorFlowFunction<Result, NewResult>,
    //     flowFunction,
    //     createFlowieRecursion
    //   )
    // }

    const pipeFlowItem = createPipeFlow(flowFunction, nextFlowFunction)

    return createFlowieRecursion(pipeFlowItem)
  }
  function split<NewResult> (
    ...nextFlowItemsList: readonly FlowItem<Result, NewResult, InitialArgument>[]
  ): Flowie<Result, any, InitialArgument> {
    const nextFlowFunctionsList = nextFlowItemsList.map(convertFlowItemToFlowFunction)
    const splittedFlowItem = createSplitFlow(nextFlowFunctionsList, flowFunction)
    return createFlowieRecursion(splittedFlowItem)
  }
  const flowieExtender: FlowieExtender<Argument, Result, InitialArgument> = { pipe, split }
  // eslint-disable-next-line functional/immutable-data
  return markAsFlowieFunction(Object.assign(executeFlow, flowieExtender), flowFunction)
}

function createAsyncExecuteFlowFunction<Argument, Result, InitialArgument> (
  flowFunction: FlowFunction<Argument, Result>
) {
  return async function executeAsyncFlow (parameter: InitialArgument): Promise<FlowResult<Result>> {
    const startTime = Date.now()
    const parameterForFirstFunction = parameter as any as Argument

    const lastResults = await (flowFunction(parameterForFirstFunction) as Promise<Result>)
    return flowieResult.success(lastResults, startTime, {})
  }
}

function createExecuteFlowFunction<Argument, Result, InitialArgument> (flowFunction: FlowFunction<Argument, Result>) {
  return function executeFlow (parameter: InitialArgument): FlowResult<Result> {
    const startTime = Date.now()
    const parameterForFirstFunction = parameter as any as Argument

    const lastResults = flowFunction(parameterForFirstFunction) as Result
    return flowieResult.success(lastResults, startTime, {})
  } as any as (parameter: InitialArgument) => Promise<FlowResult<Result>>
}
