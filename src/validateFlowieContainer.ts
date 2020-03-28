import { Set } from 'immutable'

import { FlowieContainer } from './createFlowieContainer'
import { Flow } from './flowie.type'

export default function validateFlowieContainer (flow: Flow, flowieContainer: FlowieContainer): Error | null {
  const functionNames = flow.pipe || flow.split
  const notRegisteredFunctions = Set(functionNames.filter(findNotRegisteredFunctions, flowieContainer))

  if (!notRegisteredFunctions.size) return null

  return new TypeError(
    `There is no functions registered on the container with this names: ${notRegisteredFunctions.join(', ')}`
  )
}

function findNotRegisteredFunctions (this: FlowieContainer, functionName: string): boolean {
  return typeof functionName === 'string' && !(functionName in this.functionsContainer)
}
