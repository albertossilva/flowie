import { Map as ImmutableMap } from 'immutable'

import { FlowResult, FlowFunctionResult } from './flowieResult'

export interface InitialFlowie<Argument = any, Result = any> {
  (...flowFunctionsList: readonly FlowFunction<Argument, Result>[]): Flowie<Argument, Result>
}

export interface Flowie<Argument, Result, InitialArgument = Argument> {
  readonly split: SplitFlowFunction<Result, InitialArgument>
  readonly pipe: <NewResult>(flowFunction: FlowFunction<Result, NewResult>) => Flowie<Result, NewResult, InitialArgument>
  readonly executeFlow: <Result>(parameter: InitialArgument) => Promise<FlowResult<Result>>
}

export interface SplitFlowFunction<Result, InitialArgument> {
  <NewResult1, NewResult2>(
    flowFunction1: Flowie<Result, NewResult1, InitialArgument>,
    flowFunction2: Flowie<Result, NewResult2, InitialArgument>
  ): Flowie<Result, Promise<readonly [NewResult1, NewResult2]>, InitialArgument>

  <NewResult1, NewResult2, NewResult3>(
      flowFunction1: Flowie<Result, NewResult1, InitialArgument>,
      flowFunction2: Flowie<Result, NewResult2, InitialArgument>,
      flowFunction3: Flowie<Result, NewResult3, InitialArgument>,
  ): Flowie<Result, Promise<readonly [NewResult1, NewResult2, NewResult3]>, InitialArgument>

  <NewResult1, NewResult2, NewResult3, NewResult4>(
    flowFunction1: Flowie<Result, NewResult1, InitialArgument>,
    flowFunction2: Flowie<Result, NewResult2, InitialArgument>,
    flowFunction3: Flowie<Result, NewResult3, InitialArgument>,
    flowFunction4: Flowie<Result, NewResult4, InitialArgument>,
  ): Flowie<Result, Promise<readonly [NewResult1, NewResult2, NewResult3, NewResult4]>, InitialArgument>

  <NewResult1, NewResult2, NewResult3, NewResult4, NewResult5>(
      flowFunction1: Flowie<Result, NewResult1, InitialArgument>,
      flowFunction2: Flowie<Result, NewResult2, InitialArgument>,
      flowFunction3: Flowie<Result, NewResult3, InitialArgument>,
      flowFunction4: Flowie<Result, NewResult4, InitialArgument>,
      flowFunction5: Flowie<Result, NewResult5, InitialArgument>,
  ): Flowie<Result, Promise<readonly [NewResult1, NewResult2, NewResult3, NewResult4, NewResult5]>, InitialArgument>

  (...flowFunctionList: readonly Flowie<Result, any, InitialArgument>[]):
    Flowie<Result, Promise<readonly any[]>, InitialArgument>
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
