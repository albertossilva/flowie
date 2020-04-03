import { FlowItem, Flowie, FlowieExtender } from '../types'

import { FlowieContainer } from '../container/createFlowieContainer'
import { FlowResult } from './flowieResult'
import compileFlowDeclaration from '../compiler/compileFlowDeclaration'
import { FlowDeclarationManager } from '../declaration/createFlowDeclarationManager'

export default function createFlowieRuntime<Argument, Result, InitialArgument = Argument> (
  flowieContainer: FlowieContainer,
  flowDeclarationManager: FlowDeclarationManager
): Flowie<Argument, Result> {
  const executeCompiledFlow = compileFlowDeclaration<Argument, Result>(flowDeclarationManager)

  function executeFlow (argument: Argument): FlowResult<Result> | Promise<FlowResult<Result>> {
    return executeCompiledFlow(flowieContainer, argument)
  }

  function pipe<NewResult> (nextFlowItem: FlowItem<Result, NewResult>): Flowie<Result, NewResult, InitialArgument> {
    const nextFlowieContainer = flowieContainer.register(nextFlowItem)
    const [uniqueFlowItem] = nextFlowieContainer.latestDetailsAdded
    const nextFlowDeclaration = flowDeclarationManager.pipe(uniqueFlowItem)

    return createFlowieRuntime<Result, NewResult, InitialArgument>(nextFlowieContainer, nextFlowDeclaration)
  }

  // function split<NewResult> (
  //   ...nextFlowItemsList: readonly FlowItem<Result, NewResult, InitialArgument>[]
  // ): Flowie<Result, any, InitialArgument> {
  //   const nextFlowieContainer = flowieContainer.register(...nextFlowItemsList)
  //   const nextFlowDeclaration = flowDeclarationManager.split(nextFlowieContainer.latestDetailsAdded)

  //   return createFlowieRuntime<Result, NewResult, InitialArgument>(nextFlowieContainer, nextFlowDeclaration)
  // }

  const flowieExtender: FlowieExtender<Argument, Result> = { pipe } as any // , split }
  // eslint-disable-next-line functional/immutable-data
  return Object.assign(executeFlow, flowieExtender)
}
