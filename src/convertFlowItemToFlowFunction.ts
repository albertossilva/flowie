import { isFlowieFunction, getFlowieFunction } from './flowieFunctionSymbol'
import { FlowItem, FlowFunction } from './flowie.type'

export default function convertFlowItemToFlowFunction<Result, NewResult> (flowItem: FlowItem<Result, NewResult, Result>) {
  return (isFlowieFunction(flowItem) ? getFlowieFunction(flowItem) : flowItem) as FlowFunction<Result, NewResult>
}
