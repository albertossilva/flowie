export default function flowie<Argument, Result> (flowFunction: FlowFunction<Argument, Result>): Flowie<Argument, Result> {
  return createFlowie([], flowFunction)
}

function createFlowie<Argument, Result> (
  previousFunctions: readonly FlowFunction[],
  newFlowFunction: FlowFunction<Argument, Result>
): Flowie<Argument, Result> {
  const flowFunctionList = previousFunctions.concat(newFlowFunction)

  return {
    pipeTo<NewResult> (flowFunction: FlowFunction<Result, NewResult>): Flowie<Result, NewResult> {
      return createFlowie(flowFunctionList, flowFunction)
    },
    executeFlow (parameter: Argument): FlowResult<Result> {
      return {
        result: flowFunctionList.reduce<Result>(pipeSynchronousFunctions, parameter as any)
      }
    }
  }
}

function pipeSynchronousFunctions (previousValue: any, flowFunction: FlowFunction): any {
  return flowFunction(previousValue)
}

export interface Flowie<Argument, Result> {
  readonly pipeTo: <NewResult>(flowFunction: FlowFunction<Result, NewResult>) => Flowie<Result, NewResult>
  readonly executeFlow: (parameter: Argument) => FlowResult<Result>
}

export type FlowFunction<Argument = any, Result = any> = (firstParameter: Argument) => Result

export interface FlowResult<Result> {
  readonly result: Result
}
