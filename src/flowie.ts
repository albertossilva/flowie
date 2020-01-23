import { Map as ImmutableMap } from 'immutable'

export default function flowie<Argument, Result> (flowFunction: FlowFunction<Argument, Result>): Flowie<Argument, Result> {
  return createFlowie([], flowFunction)
}

function createFlowie<Argument, Result, InitialArgument = Argument> (previousFunctions: readonly FlowFunction[], newFlowFunction: FlowFunction<Argument, Result>): Flowie<Argument, Result, InitialArgument> {
  const flowFunctionList = previousFunctions.concat(newFlowFunction)

  return {
    pipe<NewResult> (flowFunction: FlowFunction<Result, NewResult>): Flowie<Result, NewResult, InitialArgument> {
      return createFlowie(flowFunctionList, flowFunction)
    },
    async executeFlow (parameter: InitialArgument): Promise<FlowResult<Result>> {
      const startTime = Date.now()
      const { result, functionsReport } = await flowFunctionList.reduce<Promise<FunctionReport<Result>>>(
          pipeSynchronousFunctions as any,
          Promise.resolve({
            result: parameter,
            functionsReport: ImmutableMap<string, FlowFunctionResult>()
          }) as any
      )

      return {
        result,
        executionTime: Date.now() - startTime,
        functions: functionsReport.toJS() as any
      }
    }
  }
}

async function pipeSynchronousFunctions (previousValue: Promise<FunctionReport<any>>, flowFunction: FlowFunction): Promise<FunctionReport<any>> {
  const previousFunctionReport = await previousValue
  const startTime = Date.now()
  const result = await flowFunction(previousFunctionReport.result)

  const report = {
    executionTime: Date.now() - startTime
  }

  return {
    result,
    functionsReport: previousFunctionReport.functionsReport.set(flowFunction.name, report)
  }
}

export interface Flowie<Argument, Result, InitialArgument = Argument> {
  readonly pipe: <NewResult>(flowFunction: FlowFunction<Result, NewResult>) => Flowie<Result, NewResult, InitialArgument>
  readonly executeFlow: (parameter: InitialArgument) => Promise<FlowResult<Result>>
}

export type FlowFunction<Argument = any, Result = any> = (firstParameter: Argument) => Result

export interface FlowResult<Result> {
  readonly result: Result
  readonly executionTime: number
  readonly functions: Readonly<Record<string, FlowFunctionResult>>
}

export interface FlowFunctionResult {
  readonly executionTime: number
}

export interface FunctionReport<Result> {
  readonly result: Result
  readonly functionsReport: ImmutableMap<string, FlowFunctionResult>
}
