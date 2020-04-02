import { InitializeFlowie, FlowItem, Flowie, FlowieExtender } from '../types'

import createFlowieContainer, { FlowieContainer } from '../container/createFlowieContainer'
import { FlowResult } from '../flowieResult'
import compileFlowDeclaration from '../compiler/compileFlowDeclaration'
import createFlowDeclaration, { FlowDeclarationManager } from '../declaration/createFlowDeclaration'

export const flowie = createFlowie as InitializeFlowie

export default flowie

function createFlowie<Argument, Result> (
  ...flowItemsList: readonly FlowItem<Argument, Result>[]
): Flowie<Argument, Result> {
  const flowieContainer = createFlowieContainer().register(...flowItemsList)

  const flowDeclaration = createFlowDeclaration(flowieContainer.latestDetailsAdded)

  return createFlowieRuntime(flowieContainer, flowDeclaration)
}

function createFlowieRuntime<Argument, Result, InitialArgument = Argument> (
  flowieContainer: FlowieContainer,
  flowDeclaration: FlowDeclarationManager
): Flowie<Argument, Result> {
  const executeCompiledFlow = compileFlowDeclaration<Argument, Result>(flowDeclaration)

  function executeFlow (argument: Argument): FlowResult<Result> | Promise<FlowResult<Result>> {
    return executeCompiledFlow(flowieContainer, argument)
  }

  function pipe<NewResult> (nextFlowItem: FlowItem<Result, NewResult>): Flowie<Result, NewResult, InitialArgument> {
    const nextFlowieContainer = flowieContainer.register(nextFlowItem)
    const nextFlowDeclaration = flowDeclaration.pipe(nextFlowieContainer.latestDetailsAdded[0])

    return createFlowieRuntime<Result, NewResult, InitialArgument>(nextFlowieContainer, nextFlowDeclaration)
  }

  function split<NewResult> (
    ...nextFlowItemsList: readonly FlowItem<Result, NewResult, InitialArgument>[]
  ): Flowie<Result, any, InitialArgument> {
    const nextFlowieContainer = flowieContainer.register(...nextFlowItemsList)
    const nextFlowDeclaration = flowDeclaration.split(nextFlowieContainer.latestDetailsAdded)

    return createFlowieRuntime<Result, NewResult, InitialArgument>(nextFlowieContainer, nextFlowDeclaration)
  }

  const flowieExtender: FlowieExtender<Argument, Result> = { pipe, split }
  // eslint-disable-next-line functional/immutable-data
  return Object.assign(executeFlow, flowieExtender)
}
