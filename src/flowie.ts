import { Map as ImmutableMap } from 'immutable'
import { genSequence } from 'gensequence'

import * as _get from 'lodash.get'

import { FlowFunction, Flowie, FunctionReport } from './flowie.type'
import flowieResult, { FlowResult, FlowFunctionResult } from './flowieResult'

export default function flowie<Argument, Result> (
  ...flowFunctionsList: readonly FlowFunction<Argument, Result>[]
): Flowie<Argument, Result> {
  const isSplit = flowFunctionsList.length > 1
  if (!isSplit) return createFlowie([], flowFunctionsList[0])

  const flowieFromFunctionList = flowFunctionsList.map(convertFlowFunctionToFlowie)
  const splittedFlowFunction = createSplittedFlowFunction<Argument, Result>(flowieFromFunctionList)
  const flowieForSplitFlow = flowie(splittedFlowFunction)

  return flowieForSplitFlow as Flowie<Argument, DoesNotMatter>
}

function createFlowie<Argument, Result, InitialArgument = Argument> (
  previousFunctionsList: readonly FlowFunction[], newFlowFunction: FlowFunction<Argument, Result>
): Flowie<Argument, Result, InitialArgument> {
  const flowFunctionList = previousFunctionsList.concat(newFlowFunction)

  return {
    split (...flowieList: readonly Flowie<Result, unknown, InitialArgument>[]):
      Flowie<Result, Promise<DoesNotMatter>, InitialArgument> {
      const splittedFlowFunction = createSplittedFlowFunction<Argument, Result, InitialArgument>(flowieList)
      const splittedFlowie = createFlowie<Argument, Promise<readonly Result[]>, InitialArgument>(
        flowFunctionList,
        splittedFlowFunction
      )
      return splittedFlowie
    },
    pipe<NewResult> (flowFunction: FlowFunction<Result, NewResult>): Flowie<Result, NewResult, InitialArgument> {
      return createFlowie(flowFunctionList, flowFunction)
    },
    async executeFlow<Result> (parameter: InitialArgument): Promise<FlowResult<Result>> {
      const startTime = Date.now()

      const initialFunctionReport = {
        result: parameter as unknown as Result,
        functionsReport: ImmutableMap<string, FlowFunctionResult>()
      } as FunctionReport<Result>

      const { result, functionsReport } = await flowFunctionList.reduce<Promise<FunctionReport<Result>>>(
        executeFlowStep,
        Promise.resolve(initialFunctionReport)
      )

      return flowieResult.success(
        result,
        startTime,
        functionsReport.toJS() as Readonly<Record<string, FlowFunctionResult>>
      )
    }
  }
}

function createSplittedFlowFunction<Argument, SplittedResult, InitialArgument = Argument> (
  flowieList: readonly Flowie<Argument, unknown, InitialArgument>[]
) {
  return function executeSplittedFlow (argument: Argument): Promise<readonly SplittedResult[]> {
    const results = flowieList.map(getFlowFunctionResult, { argument }) as readonly Promise<SplittedResult>[]
    return Promise.all(results)
  }
}

async function getFlowFunctionResult<Argument, Result, InitialArgument> (
  this: { readonly argument: InitialArgument },
  flowieItem: Flowie<Argument, Result, InitialArgument>
) {
  const flowieResult = await flowieItem.executeFlow(this.argument)
  return flowieResult.result as Result
}

function convertFlowFunctionToFlowie<Argument> (
  flowFunction: FlowFunction<Argument, unknown>
): Flowie<Argument, unknown> {
  return flowie<Argument, unknown>(flowFunction)
}

async function executeFlowStep<Result> (
  previousValue: Promise<FunctionReport<Result>>, flowFunction: FlowFunction
): Promise<FunctionReport<Result>> {
  const previousFunctionReport = await previousValue
  const startTime = Date.now()

  const nextFunction = _get(previousFunctionReport.result, 'next')

  if (typeof nextFunction === 'function') {
    const { result } = await genSequence(previousFunctionReport.result as unknown as Iterable<Result>)
      .reduceAsync(bla, { flowFunction, result: null })

    const report = {
      executionTime: Date.now() - startTime
    }
    return {
      result,
      functionsReport: previousFunctionReport.functionsReport.set(flowFunction.name, report)
    }
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

async function bla (
  { flowFunction }: { readonly flowFunction: FlowFunction<unknown, unknown>, readonly result: unknown },
  item: unknown
) {
  const result = await flowFunction(item)
  return { result, flowFunction }
}

type DoesNotMatter = any
