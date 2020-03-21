import { Map as ImmutableMap } from 'immutable'

import { FlowResult, FlowFunctionResult } from './flowieResult'

export interface InitialFlowie<Argument = any, Result = any> {
  (...flowFunctionsList: readonly FlowFunction<Argument, Result>[]): Flowie<Argument, Result>
}

export interface Flowie<Argument, Result, InitialArgument = Argument> {
  readonly split: (...flowFunctionList: readonly any[]) => any
  readonly pipe: <NewResult>(flowFunction: FlowFunction<Result, NewResult>) => Flowie<Result, NewResult, InitialArgument>
  readonly executeFlow: <Result>(parameter: InitialArgument) => Promise<FlowResult<Result>>
}

export interface Flow {
  readonly pipe?: readonly string[]
  readonly split?: readonly string[]
}

export interface FlowFunction<Argument = any, Result = any> {
  (firstParameter: Argument): Result
}

export interface FunctionReport<Result> {
  readonly result: Result
  readonly functionsReport: ImmutableMap<string, FlowFunctionResult>
}

export type NoTypedFlowie = Flowie<any, any>
