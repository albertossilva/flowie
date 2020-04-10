import { InitializeFlowie, FlowItem, Flowie } from '../runtime.types'
import { PreparedFlowie } from '../prepared.types'

import { FlowieContainer, isFlowieContainer } from '../container/createFlowieContainer'
import buildPreparedFlowieManager from '../declaration/buildFlowDeclaration'

import createFlowieRuntime, { createFlowieFromItems } from './createFlowieRuntime'

export const flowie = createFlowie as InitializeFlowie

export default flowie

function createFlowie<Argument, Result> (
  ...flowItemsList: (readonly FlowItem<Argument, Result>[]) | (readonly [FlowieContainer, PreparedFlowie])
): Flowie<Argument, Result> {
  const [flowieContainer, preparedFlowieCandidate] = flowItemsList as (readonly [FlowieContainer, PreparedFlowie])
  if (isFlowieContainer(flowieContainer)) {
    const flowDeclaration = buildPreparedFlowieManager(preparedFlowieCandidate, flowieContainer)

    return createFlowieRuntime(flowieContainer, flowDeclaration)
  }

  return createFlowieFromItems(flowItemsList as readonly FlowItem<Argument, Result>[])
}
