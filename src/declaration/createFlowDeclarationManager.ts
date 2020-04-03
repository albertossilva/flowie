import { Set as ImmutableSet } from 'immutable'

import { FlowieExecutionDeclaration, FlowFunctionDetails, PipeFlow, SplitFlow } from '../types'

export default function createFlowDeclarationManager<Argument, Result> (
  flowFunctionDetailsList: readonly FlowFunctionDetails[],
  previousDeclaration?: FlowieExecutionDeclaration
): FlowDeclarationManager {
  const flowDeclaration = addNextItemToFlowDeclaration(flowFunctionDetailsList, previousDeclaration)

  return {
    ...flowDeclaration,
    pipe (flowFunctionDetails: FlowFunctionDetails) {
      return createFlowDeclarationManager([flowFunctionDetails], flowDeclaration)
    },
    split (flowFunctionDetailsList: readonly FlowFunctionDetails[]) {
      return createFlowDeclarationManager(flowFunctionDetailsList, flowDeclaration)
    }
  }
}

export interface FlowDeclarationManager extends FlowieExecutionDeclaration {
  readonly pipe: (flowFunctionDetails: FlowFunctionDetails) => FlowDeclarationManager
  readonly split: (flowFunctionDetailsList: readonly FlowFunctionDetails[]) => FlowDeclarationManager
}

function addNextItemToFlowDeclaration (
  flowFunctionDetailsList: readonly FlowFunctionDetails[],
  previousDeclaration?: FlowieExecutionDeclaration
): FlowieExecutionDeclaration {
  const functionNames = flowFunctionDetailsList.map(getName)

  if (!previousDeclaration) {
    return {
      isAsync: flowFunctionDetailsList.some(isAsync),
      allFunctionsNames: ImmutableSet(flowFunctionDetailsList.map(getName)),
      flows: [createPipeOrSplitFlow(flowFunctionDetailsList)]
    }
  }

  return {
    isAsync: previousDeclaration.isAsync || flowFunctionDetailsList.some(isAsync),
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

function getName ({ name }: FlowFunctionDetails) {
  return name
}

function isAsync ({ isAsync }: FlowFunctionDetails) {
  return isAsync
}
