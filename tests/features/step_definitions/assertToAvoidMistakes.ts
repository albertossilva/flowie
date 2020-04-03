import { assert } from 'chai'
import { FlowieContainer, FlowResult } from '../../../src/index'

export function assertFlowIsNotRegistered<T> (flowName: string, flows: Record<string, T>) {
  const flowNamesList = Object.keys(flows)
  assert.ok(
    !flowNamesList.includes(flowName),
    `A flow is already register with name ${flowName}, list of flows: ${flowNamesList.join(', ')}`
  )
}

export function assertFlowIsRegistered<T> (flowName: string, flows: Record<string, T>) {
  const flowNamesList = Object.keys(flowName)

  assert.ok(
    flowName,
    `No flow with name ${flowName} is registered, see the list ${flowNamesList.join(', ')}`
  )

  return flows[flowName]
}

export function assertFunctionIsRegistered (functionName: string, flowieContainer: FlowieContainer) {
  const functionCandidate = flowieContainer.functionsContainer[functionName]

  assert.ok(
    functionCandidate,
    `No function with name ${functionName} is registered, see the list ${flowieContainer.allFunctionsNames}`
  )

  return functionCandidate
}

export function assertResults<T> (flowName: string, flowResults: Record<string, FlowResult<T>>) {
  const flowResultsRegistered = Object.keys(flowResults)

  assert.ok(
    flowName,
    `No result for flow ${flowName} has been collected, see the list ${flowResultsRegistered.join(', ')}`
  )

  return flowResults[flowName]
}
