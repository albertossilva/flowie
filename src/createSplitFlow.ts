import { FlowFunction } from './flowie.type'

export default function createSplitFlow<Result, NewResult, Argument = Result> (
  nextFlowFunctionsList: readonly FlowFunction<Result, NewResult>[],
  previousFlowFunction?: FlowFunction<Argument, Result>
) {
  const callPreviousFunction = previousFlowFunction
    ? (argument: Argument) => previousFlowFunction(argument) as Result
    : (argument: Argument) => argument

  async function executeSplitFlow (argument: Argument): Promise<readonly NewResult[]> {
    const previousResult = await callPreviousFunction(argument)
    const results = nextFlowFunctionsList.map(callFlowFunction, { argument: previousResult }) as readonly Promise<NewResult>[]

    return Promise.all(results)
  }

  return executeSplitFlow
}

async function callFlowFunction<Argument, Result> (
  this: { readonly argument: Argument },
  flowFunction: FlowFunction<Argument, Result>
) {
  const flowieResult = await flowFunction(this.argument)
  return flowieResult
}
