import { isAsyncFunction, isGeneratorFunction } from '../functionConstructors'
import { FlowFunction, FlowFunctionDetailsWithItem } from '../runtime.types'

const RegisterFunctionSymbol = Symbol('RegisterFunctionSymbol')

export default function buildFlowFunctionDetails(
  name: string,
  flowFunction: FlowFunction,
): FlowFunctionDetailsWithItem {
  return {
    name,
    flowFunction,
    isAsync: isAsyncFunction(flowFunction),
    isGenerator: isGeneratorFunction(flowFunction),
    parallelExecutions: 1,
    registerSignature: RegisterFunctionSymbol,
  }
}

export function isRegisteredFlowFunctionDetail(flowFunctionDetails: FlowFunctionDetailsWithItem): boolean {
  return flowFunctionDetails.registerSignature === RegisterFunctionSymbol
}
