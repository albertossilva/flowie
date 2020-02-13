export default function createFlowieContainer (): FlowieContainer {
  return {
    functionsContainer: Object.freeze({}),
    register (flowItemName: string, flowFunction: Function): FlowieContainer {
      return registerFlowieItem({}, flowItemName, flowFunction)
    }
  }
}

function registerFlowieItem (previousFunctionsContainer: FunctionsContainer, flowItemName: string, flowFunction: Function): FlowieContainer {
  const newFunctionsContainer = { ...previousFunctionsContainer, [flowItemName]: flowFunction }
  const newFunctionsContainerProxy =
    new Proxy(newFunctionsContainer, { get: getItemFromContainer })

  return {
    functionsContainer: Object.freeze(newFunctionsContainerProxy),
    register: registerFlowieItem.bind(null, newFunctionsContainer)
  }
}

export interface FlowieContainer {
  readonly register: (flowItemName: string, flowFunction: Function) => FlowieContainer;
  readonly functionsContainer: FunctionsContainer
}

type FunctionsContainer = Record<string, Function>

function getItemFromContainer (target: FunctionsContainer, flowItemName: string): Function {
  return target[flowItemName]
}
