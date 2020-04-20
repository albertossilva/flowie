import createDebugger from 'debug'

import { FlowieContainer } from '../container/createFlowieContainer'

import { FlowFunctionDetails } from '../runtime.types'

import { PreparedFlowie, PipeFlow, SplitFlow, FlowElement, FlowieItemDeclaration } from '../prepared.types'

import createFlowDeclarationManager, { PreparedFlowieManager } from './createFlowDeclarationManager'

const debug = createDebugger('flowie:builder')

export default function buildPreparedFlowieManager (
  preparedFlowie: PreparedFlowie,
  flowieContainer: FlowieContainer
): PreparedFlowieManager {
  const [firstFlow, ...restOfFlow] = preparedFlowie.flows

  const flowFunctionDetails = convertFlowElementToDeclarable(firstFlow, flowieContainer)
  const firstManager = createFlowDeclarationManager(flowFunctionDetails)

  const { preparedFlowieManager } = restOfFlow.reduce(parseFlows, {
    preparedFlowieManager: firstManager,
    flowieContainer
  })
  debug('Prepared flow built successfully!')

  return preparedFlowieManager
}

function parseFlows (
  { preparedFlowieManager, flowieContainer }: {
    readonly preparedFlowieManager: PreparedFlowieManager,
    readonly flowieContainer: FlowieContainer
  },
  flowElement: FlowElement
) {
  const flowFunctionDetailsList = convertFlowElementToDeclarable(flowElement, flowieContainer)
  if ((flowElement as SplitFlow).split) {
    return {
      flowieContainer,
      preparedFlowieManager: preparedFlowieManager.split(flowFunctionDetailsList)
    }
  }

  const [flowFunctionDetails] = flowFunctionDetailsList
  return {
    flowieContainer,
    preparedFlowieManager: preparedFlowieManager.pipe(flowFunctionDetails)
  }
}

function convertFlowElementToDeclarable (
  flowElement: FlowElement,
  flowieContainer: FlowieContainer
): readonly (FlowFunctionDetails | PreparedFlowieManager)[] {
  const pipeFlow = (flowElement as PipeFlow)
  if (pipeFlow.pipe) {
    if (typeof pipeFlow.pipe === 'string') {
      return [convertToFlowFunctionDetails(pipeFlow.pipe, flowieContainer)]
    }

    return [
      buildPreparedFlowieManager(
        { flows: [pipeFlow.pipe], name: pipeFlow.name },
        flowieContainer
      )
    ]
  }

  const splitFlow = (flowElement as SplitFlow)
  if (splitFlow.split) {
    const splitFlow = (flowElement as SplitFlow)
    return splitFlow.split.map(convertSplitToFlowFunctionDetails, { flowieContainer })
  }

  return [buildPreparedFlowieManager(flowElement as PreparedFlowie, flowieContainer)]
}

function convertSplitToFlowFunctionDetails (
  this: { readonly flowieContainer: FlowieContainer },
  flowieItemDeclaration: FlowieItemDeclaration
) {
  if (typeof flowieItemDeclaration === 'string') {
    return convertToFlowFunctionDetails(flowieItemDeclaration, this.flowieContainer)
  }

  return buildPreparedFlowieManager(
    { flows: [flowieItemDeclaration], name: flowieItemDeclaration.name },
    this.flowieContainer
  )
}

function convertToFlowFunctionDetails (functionName: string, flowieContainer: FlowieContainer): FlowFunctionDetails {
  const { isAsync, isGenerator } = flowieContainer.functionsContainer[functionName]
  return {
    name: functionName,
    isAsync,
    isGenerator
  }
}
