import { InitializeFlowie, FlowItem, Flowie, FlowieDeclaration } from '../types'

import { FlowieContainer, isFlowieContainer } from '../container/createFlowieContainer'
import buildFlowDeclaration from '../declaration/buildFlowDeclaration'

import createFlowieRuntime, { createFlowieFromItems } from './createFlowieRuntime'

export const flowie = createFlowie as InitializeFlowie

export default flowie

function createFlowie<Argument, Result> (
  ...flowItemsList: (readonly FlowItem<Argument, Result>[]) | (readonly [FlowieContainer, FlowieDeclaration])
): Flowie<Argument, Result> {
  const [flowieContainer, flowDeclarationCandidate] = flowItemsList as (readonly [FlowieContainer, FlowieDeclaration])
  if (isFlowieContainer(flowieContainer)) {
    const flowDeclaration = buildFlowDeclaration(flowDeclarationCandidate, flowieContainer)

    return createFlowieRuntime(flowieContainer, flowDeclaration)
  }

  return createFlowieFromItems(flowItemsList as readonly FlowItem<Argument, Result>[])
}
