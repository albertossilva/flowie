export default function createFlowieContainer (): FlowieContainer {
  return {
    functionsContainer: {},
    register (flowItemName: string, flowFunction: Function): FlowieContainer {
      return registerFlowieItem({}, flowItemName, flowFunction)
    }
  }
}

function registerFlowieItem (previousFunctionsContainer: FunctionsContainer, flowItemName: string, flowFunction: Function): FlowieContainer {
  const newFunctionsContainer = { ...previousFunctionsContainer, [flowItemName]: flowFunction }

  return {
    functionsContainer: newFunctionsContainer,
    register: registerFlowieItem.bind(null, newFunctionsContainer)
  }
}

export interface FlowieContainer {
  readonly register: (flowItemName: string, flowFunction: Function) => FlowieContainer;
  readonly functionsContainer: FunctionsContainer
}

type FunctionsContainer = Record<string, Function>
