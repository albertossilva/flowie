import { Map as ImmutableMap } from 'immutable'
import * as _get from 'lodash.get'

import { FlowFunction, Flowie, FunctionReport } from './flowie.type'
import flowieResult, { FlowResult, FlowFunctionResult } from './flowieResult'

export default function flowie<Argument, Result> (
  ...flowFunctionsList: readonly FlowFunction<Argument, Result>[]
): Flowie<Argument, Result> {
  const isSplit = flowFunctionsList.length > 1
  if (!isSplit) return createFlowie([], flowFunctionsList[0])

  const splittedFlowieList = flowFunctionsList.map(convertFlowFunctionToFlowie)
  return flowie(createSplitFlowieItem(splittedFlowieList)) as Flowie<any, any>
}

function createFlowie<Argument, Result, InitialArgument = Argument> (
  previousFunctions: readonly FlowFunction[], newFlowFunction: FlowFunction<Argument, Result>
): Flowie<Argument, Result, InitialArgument> {
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
        executeFlowStep as any,
        Promise.resolve({
          result: parameter,
          functionsReport: ImmutableMap<string, FlowFunctionResult>()
        }) as any
      )

      return flowieResult.success(result, startTime, functionsReport.toJS() as any)
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

async function executeFlowStep (
  previousValue: Promise<FunctionReport<any>>, flowFunction: FlowFunction
): Promise<FunctionReport<any>> {
  const previousFunctionReport = await previousValue
  const startTime = Date.now()

  const nextFunction = _get(previousFunctionReport.result, 'next')

  if (typeof nextFunction === 'function') {
    let lastResult: any
    for (const item of previousFunctionReport.result) {
      const result = await flowFunction(item)
      lastResult = result
    }

    const report = {
      executionTime: Date.now() - startTime
    }
    return { result: lastResult, functionsReport: previousFunctionReport.functionsReport.set(flowFunction.name, report) }
  }

  const result = await flowFunction(previousFunctionReport.result)
  const report = {
    executionTime: Date.now() - startTime
  }

  return {
    result,
    functionsReport: previousFunctionReport.functionsReport.set(flowFunction.name, report)
  }
}
