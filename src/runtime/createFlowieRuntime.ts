import createDebugger from 'debug'
import { FlowItem, Flowie, FlowieExtender, FlowFunction, FlowFunctionDetailsWithItem } from '../runtime.types'

import createFlowieContainer, { FlowieContainer } from '../container/createFlowieContainer'
import compileFlowDeclaration from '../compiler/compileFlowDeclaration'
import createFlowDeclarationManager, { PreparedFlowieManager } from '../declaration/createFlowDeclarationManager'

import { FlowResult } from './flowieResult'
import {
  signAsFlowieFunction,
  isSignedAsFlowieFunction,
  getFlowieContainer,
  getFlowieDeclarationManager
} from './flowieSignature'

const debug = createDebugger('flowie:runtime')

export default function createFlowieRuntime<Argument, Result, InitialArgument = Argument, Context = never> (
  flowieContainer: FlowieContainer,
  preparedFlowieManager: PreparedFlowieManager
): Flowie<Argument, Result, any, Context> {
  const executeCompiledFlow = compileFlowDeclaration<Argument, Result, Context>(preparedFlowieManager, flowieContainer)
  debug('Functions registered %o', Array.from(flowieContainer.allFunctionsNames))

  function executeFlow (argument: Argument, context: Context): FlowResult<Result> | Promise<FlowResult<Result>> {
    const transaction = Math.random().toString(36).slice(2)
    const flowName = preparedFlowieManager.name || 'anonymous'
    debug('Starting flow %o, transaction %o', preparedFlowieManager.name || 'anonymous', transaction)
    const result = executeCompiledFlow(argument, context)
    debug('Finished flow %o, transaction %o', flowName, transaction)
    return result
  }

  function pipe<NewResult> (nextFlowItem: FlowItem<Result, NewResult>): Flowie<Result, NewResult, InitialArgument> {
    if (isSignedAsFlowieFunction(nextFlowItem)) {
      const flowie = nextFlowItem as Flowie<Result, NewResult, InitialArgument>
      const nextFlowieContainer = getFlowieContainer(flowie)
      const nextFlowieDeclarationManager = getFlowieDeclarationManager(flowie)
      const mergedFlowieContainer = flowieContainer.merge(nextFlowieContainer)

      const nextFlowDeclaration = preparedFlowieManager.pipe(nextFlowieDeclarationManager)

      return createFlowieRuntime<Result, NewResult, InitialArgument, Context>(
        mergedFlowieContainer,
        nextFlowDeclaration
      )
    }

    const nextFlowieContainer = flowieContainer.register(nextFlowItem)
    const [uniqueFlowItem] = nextFlowieContainer.latestDetailsAdded

    const nextFlowDeclaration = preparedFlowieManager.pipe(uniqueFlowItem)

    return createFlowieRuntime<Result, NewResult, InitialArgument, Context>(nextFlowieContainer, nextFlowDeclaration)
  }

  function split<NewResult> (
    ...nextFlowItemsList: readonly FlowItem<Result, NewResult, InitialArgument>[]
  ): Flowie<Result, any, InitialArgument> {
    const flowFunctionOrFlowieContainerList = nextFlowItemsList
      .map(getFlowieContainerOrFunction) as readonly (FlowieContainer | FlowFunction<Argument, Result>)[]

    const nextFlowieContainer = flowieContainer.merge(...[flowieContainer, ...flowFunctionOrFlowieContainerList])

    const flowDeclarationOrFunctionList = nextFlowItemsList
      .map(
        getFlowieDeclarationOrFunction,
        { flowieContainer: nextFlowieContainer }
      ) as readonly FlowieDeclarationOrFlowFunctionDetails<Argument, Result>[]

    const nextFlowDeclaration = preparedFlowieManager.split(flowDeclarationOrFunctionList)

    return createFlowieRuntime<Result, NewResult, InitialArgument>(nextFlowieContainer, nextFlowDeclaration)
  }

  const flowieExtender: FlowieExtender<Argument, Result> = { pipe, split }
  // eslint-disable-next-line functional/immutable-data
  return signAsFlowieFunction(Object.assign(executeFlow, flowieExtender), flowieContainer, preparedFlowieManager)
}

export function createFlowieFromItems<Argument, Result> (
  flowItemsList: readonly FlowItem<Argument, Result>[]
): Flowie<Argument, Result> {
  const [firstFlowieItem] = flowItemsList
  if (flowItemsList.length === 1 && isSignedAsFlowieFunction(firstFlowieItem)) {
    return firstFlowieItem as Flowie<Argument, Result>
  }

  const flowFunctionOrFlowieContainerList = flowItemsList
    .map(getFlowieContainerOrFunction) as readonly (FlowieContainer | FlowFunction<Argument, Result>)[]

  const flowieContainer = createFlowieContainer().merge(...flowFunctionOrFlowieContainerList)

  const flowDeclarationOrFunctionList = flowItemsList
    .map(
      getFlowieDeclarationOrFunction,
      { flowieContainer }
    ) as readonly FlowieDeclarationOrFlowFunctionDetails<Argument, Result>[]

  const flowDeclaration = createFlowDeclarationManager(flowDeclarationOrFunctionList)

  return createFlowieRuntime<Argument, Result>(flowieContainer, flowDeclaration)
}

function getFlowieContainerOrFunction<Argument, Result> (
  flowItem: FlowItem
): FlowieContainer | FlowFunction<Argument, Result> {
  if (isSignedAsFlowieFunction(flowItem)) {
    return getFlowieContainer(flowItem as Flowie<Argument, Result>)
  }

  return flowItem as FlowFunction<Argument, Result>
}

function getFlowieDeclarationOrFunction<Argument, Result> (
  this: { readonly flowieContainer: FlowieContainer },
  flowItem: FlowItem
): FlowieDeclarationOrFlowFunctionDetails<Argument, Result> {
  if (isSignedAsFlowieFunction(flowItem)) {
    return getFlowieDeclarationManager(flowItem as Flowie<Argument, Result>)
  }

  return this.flowieContainer.getFunctionDetails(flowItem)
}

type FlowieDeclarationOrFlowFunctionDetails<Argument, Result> =
  PreparedFlowieManager | FlowFunctionDetailsWithItem<Argument, Result>
