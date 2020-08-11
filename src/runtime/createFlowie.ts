import { InitializeFlowie, FlowItemList, Flowie } from '../runtime.types'
import { PreparedFlowie } from '../prepared.types'

import { FlowieContainer, isFlowieContainer } from '../container/createFlowieContainer'
import buildPreparedFlowieManager from '../declaration/buildFlowDeclaration'

import createFlowieRuntime, { createFlowieFromItems } from './createFlowieRuntime'

export const flowie = createFlowie as InitializeFlowie

export default flowie

function createFlowie<Argument, Result, Context> (
  ...flowItemsList: FlowItemList<Argument, Result, Context> | (readonly [FlowieContainer, PreparedFlowie])
): Flowie<Argument, Result> {
  const [flowieContainer, preparedFlowieCandidate] = flowItemsList as (readonly [FlowieContainer, PreparedFlowie])
  if (isFlowieContainer(flowieContainer)) {
    const flowDeclaration = buildPreparedFlowieManager(preparedFlowieCandidate, flowieContainer)

    return createFlowieRuntime(flowieContainer, flowDeclaration)
  }

  return createFlowieFromItems(flowItemsList as FlowItemList<Argument, Result, Context>)
}
