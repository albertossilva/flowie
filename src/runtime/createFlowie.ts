import { InitializeFlowie, FlowItem, Flowie, FlowieDeclaration } from '../types'

import createFlowieContainer, { FlowieContainer, isFlowieContainer } from '../container/createFlowieContainer'
import createFlowDeclarationManager from '../declaration/createFlowDeclarationManager'
import buildFlowDeclaration from '../declaration/buildFlowDeclaration'

import createFlowieRuntime from './createFlowieRuntime'
import { signAsFlowieFunction, isSignedAsFlowieFunction } from './flowieSignature'

export const flowie = createFlowie as InitializeFlowie

export default flowie

function createFlowie<Argument, Result> (
  ...flowItemsList: (readonly FlowItem<Argument, Result>[]) | (readonly [FlowieContainer, FlowieDeclaration])
): Flowie<Argument, Result> {
  return signAsFlowieFunction(createFlowieFunction(...flowItemsList))
}

function createFlowieFunction<Argument, Result> (
  ...flowItemsList: (readonly FlowItem<Argument, Result>[]) | (readonly [FlowieContainer, FlowieDeclaration])
): Flowie<Argument, Result> {
  const [flowieContainer, flowDeclarationCandidate] = flowItemsList as (readonly [FlowieContainer, FlowieDeclaration])
  if (isFlowieContainer(flowieContainer)) {
    const flowDeclaration = buildFlowDeclaration(flowDeclarationCandidate, flowieContainer)

    return createFlowieRuntime(flowieContainer, flowDeclaration)
  }

  return createFlowieFromItems(flowItemsList as readonly FlowItem<Argument, Result>[])
}

function createFlowieFromItems<Argument, Result> (
  flowItemsList: readonly FlowItem<Argument, Result>[]
): Flowie<Argument, Result> {
  const [firstFlowieItem] = flowItemsList
  if (flowItemsList.length === 1 && isSignedAsFlowieFunction(firstFlowieItem)) {
    return firstFlowieItem as Flowie<Argument, Result>
  }
  const flowieContainer = createFlowieContainer().register(...flowItemsList)
  const flowDeclaration = createFlowDeclarationManager(flowieContainer.latestDetailsAdded)

  return createFlowieRuntime(flowieContainer, flowDeclaration)
}
