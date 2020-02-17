import { Map as ImmutableMap } from 'immutable'

export default function flowie<Argument, Result> (...flowFunctionsList: readonly FlowFunction<Argument, Result>[]): Flowie<Argument, Result> {
  if (flowFunctionsList.length === 1) return createFlowie([], flowFunctionsList[0])

  const splittedFlowieList = flowFunctionsList.map(convertFlowFunctionToFlowie)
  return flowie(createSplitFlowieItem(splittedFlowieList)) as Flowie<any, any>
}

function createFlowie<Argument, Result, InitialArgument = Argument> (previousFunctions: readonly FlowFunction[], newFlowFunction: FlowFunction<Argument, Result>): Flowie<Argument, Result, InitialArgument> {
  const flowFunctionList = previousFunctions.concat(newFlowFunction)

  return {
    split (...flowieFunctionsList: readonly Flowie<any, any>[]): any {
      return createFlowie(flowFunctionList, createSplitFlowieItem(flowieFunctionsList))
    },
    pipe<NewResult> (flowFunction: FlowFunction<Result, NewResult>): Flowie<Result, NewResult, InitialArgument> {
      return createFlowie(flowFunctionList, flowFunction)
    },
    async executeFlow<Result> (parameter: InitialArgument): Promise<FlowResult<Result>> {
      const startTime = Date.now()
      const { result, functionsReport } = await flowFunctionList.reduce<Promise<FunctionReport<Result>>>(
        pipeFunction as any,
        Promise.resolve({
          result: parameter,
          functionsReport: ImmutableMap<string, FlowFunctionResult>()
        }) as any
      )

      return {
        success: true,
        result,
        executionTime: Date.now() - startTime,
        functions: functionsReport.toJS() as any
      }
    }
  }
}

function createSplitFlowieItem (flowFunctionsList: readonly Flowie<any, any>[]) {
  return (x: any): Promise<readonly any[]> => {
    return Promise.all(flowFunctionsList.map(async (flowieItem: any): Promise<any> => {
      const flowieResult = await flowieItem.executeFlow(x)
      return flowieResult.result
    }))
  }
}

function convertFlowFunctionToFlowie (flowFunction: any): Flowie<any, any> {
  return flowie<any, any>(flowFunction)
}

async function pipeFunction (previousValue: Promise<FunctionReport<any>>, flowFunction: FlowFunction): Promise<FunctionReport<any>> {
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
  readonly split: (...flowFunctionList: readonly any[]) => any
  readonly pipe: <NewResult>(flowFunction: FlowFunction<Result, NewResult>) => Flowie<Result, NewResult, InitialArgument>
  readonly executeFlow: <Result>(parameter: InitialArgument) => Promise<FlowResult<Result>>
}

export interface FlowResult<Result> {
  readonly success: boolean
  readonly error?: Error
  readonly result: Result
  readonly executionTime: number
  readonly functions: Readonly<Record<string, FlowFunctionResult>>
}

export interface FlowFunctionResult {
  readonly executionTime: number
}

export interface FlowFunction<Argument = any, Result = any> {
  (firstParameter: Argument): Result
}

interface FunctionReport<Result> {
  readonly result: Result
  readonly functionsReport: ImmutableMap<string, FlowFunctionResult>
}
