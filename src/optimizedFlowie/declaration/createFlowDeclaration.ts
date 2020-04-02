import { Set as ImmutableSet } from 'immutable'

import { FlowDeclaration, FlowFunctionDetails, PipeFlow, SplitFlow } from '../types'

export default function createFlowDeclaration<Argument, Result> (
  flowFunctionDetailsList: readonly FlowFunctionDetails[],
  previousDeclaration?: FlowDeclaration
): FlowDeclarationManager {
  const flowDeclaration = addNextItemToFlowDeclaration(flowFunctionDetailsList, previousDeclaration)

  return {
    ...flowDeclaration,
    pipe (flowFunctionDetails: FlowFunctionDetails) {
      return createFlowDeclaration([flowFunctionDetails], flowDeclaration)
    },
    split (flowFunctionDetailsList: readonly FlowFunctionDetails[]) {
      return createFlowDeclaration(flowFunctionDetailsList, flowDeclaration)
    }
  }
}

export interface FlowDeclarationManager extends FlowDeclaration {
  readonly pipe: (flowFunctionDetails: FlowFunctionDetails) => FlowDeclarationManager
  readonly split: (flowFunctionDetailsList: readonly FlowFunctionDetails[]) => FlowDeclarationManager
}

function addNextItemToFlowDeclaration (
  flowFunctionDetailsList: readonly FlowFunctionDetails[],
  previousDeclaration?: FlowDeclaration
): FlowDeclaration {
  const functionNames = flowFunctionDetailsList.map(getName)
  if (!previousDeclaration) {
    return {
      allFunctionsNames: ImmutableSet(flowFunctionDetailsList.map(getName)),
      flows: [createPipeOrSplitFlow(flowFunctionDetailsList)]
    }
  }

  return {
    allFunctionsNames: previousDeclaration.allFunctionsNames.concat(functionNames),
    flows: previousDeclaration.flows.concat(createPipeOrSplitFlow(flowFunctionDetailsList))
  }
}

function createPipeOrSplitFlow (flowFunctionDetailsList: readonly FlowFunctionDetails[]): PipeFlow | SplitFlow {
  if (flowFunctionDetailsList.length === 1) {
    return {
      pipe: {
        function: flowFunctionDetailsList[0].name
      }
    }
  }

  return {
    split: {
      functions: flowFunctionDetailsList.map(getName)
    }
  }
}

function getName (flowFunctionDetails: FlowFunctionDetails) {
  return flowFunctionDetails.name
}
