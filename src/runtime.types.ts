import { FlowResult, FlowFunctionResult } from './runtime/flowieResult'
import { FlowieContainer } from './container/createFlowieContainer'
import { PreparedFlowie } from './prepared.types'

export interface Flowie<Argument, Result, InitialArgument = Argument, Context = never>
  extends FlowieExtender<Argument, Result, InitialArgument, Context> {
  (parameter: InitialArgument, context?: Context): FlowResult<Result> | Promise<FlowResult<Result>>
}

export interface InitializeFlowie {
  <Argument, Result, Context = never>(flowItem: FlowItem<Argument, Result, Argument, Context>):
    Flowie<Argument, Result, Argument, Context>
  <Argument, Result1, Result2, Context = never>(
    flowItem1: FlowItem<Argument, Result1, Argument, Context>,
    flowItem2: FlowItem<Argument, Result2, Argument, Context>,
  ): Flowie<Argument, readonly [Result1, Result2], Argument, Context>
  <Argument, Result1, Result2, Result3, Context = never>(
    flowItem1: FlowItem<Argument, Result1, Argument, Context>,
    flowItem2: FlowItem<Argument, Result2, Argument, Context>,
    flowItem3: FlowItem<Argument, Result3, Argument, Context>,
  ): Flowie<Argument, readonly [Result1, Result2, Result3], Argument, Context>
  <Argument, Result1, Result2, Result3, Result4, Context = never>(
    flowItem1: FlowItem<Argument, Result1, Argument, Context>,
    flowItem2: FlowItem<Argument, Result2, Argument, Context>,
    flowItem3: FlowItem<Argument, Result3, Argument, Context>,
    flowItem4: FlowItem<Argument, Result4, Argument, Context>,
  ): Flowie<Argument, readonly [Result1, Result2, Result3, Result4], Argument, Context>
  <Argument, Result1, Result2, Result3, Result4, Result5, Context = never>(
    flowItem1: FlowItem<Argument, Result1, Argument, Context>,
    flowItem2: FlowItem<Argument, Result2, Argument, Context>,
    flowItem3: FlowItem<Argument, Result3, Argument, Context>,
    flowItem4: FlowItem<Argument, Result4, Argument, Context>,
    flowItem5: FlowItem<Argument, Result5, Argument, Context>,
  ): Flowie<Argument, readonly [Result1, Result2, Result3, Result4, Result5], Argument, Context>
  <Argument, Result1, Result2, Result3, Result4, Result5, Result6, Context = never>(
    flowItem1: FlowItem<Argument, Result1, Argument, Context>,
    flowItem2: FlowItem<Argument, Result2, Argument, Context>,
    flowItem3: FlowItem<Argument, Result3, Argument, Context>,
    flowItem4: FlowItem<Argument, Result4, Argument, Context>,
    flowItem5: FlowItem<Argument, Result5, Argument, Context>,
    flowItem6: FlowItem<Argument, Result6, Argument, Context>,
  ): Flowie<Argument, readonly [Result1, Result2, Result3, Result4, Result5, Result6], Argument, Context>
  <Argument, Result1, Result2, Result3, Result4, Result5, Result6, Result7, Context = never>(
    flowItem1: FlowItem<Argument, Result1, Argument, Context>,
    flowItem2: FlowItem<Argument, Result2, Argument, Context>,
    flowItem3: FlowItem<Argument, Result3, Argument, Context>,
    flowItem4: FlowItem<Argument, Result4, Argument, Context>,
    flowItem5: FlowItem<Argument, Result5, Argument, Context>,
    flowItem6: FlowItem<Argument, Result6, Argument, Context>,
    flowItem7: FlowItem<Argument, Result7, Argument, Context>,
  ): Flowie<Argument, readonly [Result1, Result2, Result3, Result4, Result5, Result6, Result7], Argument, Context>
  <Argument, Result1, Result2, Result3, Result4, Result5, Result6, Result7, Result8, Context = never>(
    flowItem1: FlowItem<Argument, Result1, Argument, Context>,
    flowItem2: FlowItem<Argument, Result2, Argument, Context>,
    flowItem3: FlowItem<Argument, Result3, Argument, Context>,
    flowItem4: FlowItem<Argument, Result4, Argument, Context>,
    flowItem5: FlowItem<Argument, Result5, Argument, Context>,
    flowItem6: FlowItem<Argument, Result6, Argument, Context>,
    flowItem7: FlowItem<Argument, Result7, Argument, Context>,
    flowItem8: FlowItem<Argument, Result8, Argument, Context>,
  ): Flowie<
    Argument,
    readonly [Result1, Result2, Result3, Result4, Result5, Result6, Result7, Result8],
    Argument,
    Context
  >
  <Argument, Result, Context = never>(...flowItemsList: readonly FlowItem<Argument, Result, Argument, Context>[]):
    Flowie<Argument, Result, Argument, Context>
  <Argument = any, Result = any, Context = never>(flowieContainer: FlowieContainer, preparedFlowie: PreparedFlowie):
    Flowie<Argument, Result, Argument, Context>
}

export interface FlowieExtender<Argument, Result, InitialArgument = Argument, Context = never> {
  readonly split: SplitFlowFunction<Result, InitialArgument, Context>
  readonly pipe: PipeFlowFunction<Result, InitialArgument, Context>
}

export interface PipeFlowFunction<Result, InitialArgument, Context> {
  <NewResult>(flowItem: FlowItem<Result, NewResult, InitialArgument, Context>):
  Flowie<Result, NewResult, InitialArgument, Context>
}

export interface SplitFlowFunction<Result, InitialArgument, Context> {
  <NewResult1, NewResult2>(
    flowItem1: FlowItem<Result, NewResult1, InitialArgument, Context>,
    flowItem2: FlowItem<Result, NewResult2, InitialArgument, Context>
  ): Flowie<Result, readonly [NewResult1, NewResult2], InitialArgument, Context>

  <NewResult1, NewResult2, NewResult3>(
    flowItem1: FlowItem<Result, NewResult1, InitialArgument, Context>,
    flowItem2: FlowItem<Result, NewResult2, InitialArgument, Context>,
    flowItem3: FlowItem<Result, NewResult3, InitialArgument, Context>,
  ): Flowie<Result, readonly [NewResult1, NewResult2, NewResult3], InitialArgument, Context>

  <NewResult1, NewResult2, NewResult3, NewResult4>(
    flowItem1: FlowItem<Result, NewResult1, InitialArgument, Context>,
    flowItem2: FlowItem<Result, NewResult2, InitialArgument, Context>,
    flowItem3: FlowItem<Result, NewResult3, InitialArgument, Context>,
    flowItem4: FlowItem<Result, NewResult4, InitialArgument, Context>,
  ): Flowie<Result, readonly [NewResult1, NewResult2, NewResult3, NewResult4], InitialArgument, Context>

  <NewResult1, NewResult2, NewResult3, NewResult4, NewResult5>(
    flowItem1: FlowItem<Result, NewResult1, InitialArgument, Context>,
    flowItem2: FlowItem<Result, NewResult2, InitialArgument, Context>,
    flowItem3: FlowItem<Result, NewResult3, InitialArgument, Context>,
    flowItem4: FlowItem<Result, NewResult4, InitialArgument, Context>,
    flowItem5: FlowItem<Result, NewResult5, InitialArgument, Context>,
  ): Flowie<Result, readonly [NewResult1, NewResult2, NewResult3, NewResult4, NewResult5], InitialArgument, Context>

  <NewResult1, NewResult2, NewResult3, NewResult4, NewResult5, NewResult6>(
    flowItem1: FlowItem<Result, NewResult1, InitialArgument, Context>,
    flowItem2: FlowItem<Result, NewResult2, InitialArgument, Context>,
    flowItem3: FlowItem<Result, NewResult3, InitialArgument, Context>,
    flowItem4: FlowItem<Result, NewResult4, InitialArgument, Context>,
    flowItem5: FlowItem<Result, NewResult5, InitialArgument, Context>,
    flowItem6: FlowItem<Result, NewResult6, InitialArgument, Context>,
  ): Flowie<
    Result,
    readonly [NewResult1, NewResult2, NewResult3, NewResult4, NewResult5, NewResult6],
    InitialArgument,
    Context
  >

  <NewResult1, NewResult2, NewResult3, NewResult4, NewResult5, NewResult6, NewResult7>(
    flowItem1: FlowItem<Result, NewResult1, InitialArgument, Context>,
    flowItem2: FlowItem<Result, NewResult2, InitialArgument, Context>,
    flowItem3: FlowItem<Result, NewResult3, InitialArgument, Context>,
    flowItem4: FlowItem<Result, NewResult4, InitialArgument, Context>,
    flowItem5: FlowItem<Result, NewResult5, InitialArgument, Context>,
    flowItem6: FlowItem<Result, NewResult6, InitialArgument, Context>,
    flowItem7: FlowItem<Result, NewResult7, InitialArgument, Context>,
  ): Flowie<
    Result,
    readonly [NewResult1, NewResult2, NewResult3, NewResult4, NewResult5, NewResult6, NewResult7],
    InitialArgument,
    Context
  >

  <NewResult1, NewResult2, NewResult3, NewResult4, NewResult5, NewResult6, NewResult7, NewResult8>(
    flowItem1: FlowItem<Result, NewResult1, InitialArgument, Context>,
    flowItem2: FlowItem<Result, NewResult2, InitialArgument, Context>,
    flowItem3: FlowItem<Result, NewResult3, InitialArgument, Context>,
    flowItem4: FlowItem<Result, NewResult4, InitialArgument, Context>,
    flowItem5: FlowItem<Result, NewResult5, InitialArgument, Context>,
    flowItem6: FlowItem<Result, NewResult6, InitialArgument, Context>,
    flowItem7: FlowItem<Result, NewResult7, InitialArgument, Context>,
    flowItem8: FlowItem<Result, NewResult8, InitialArgument, Context>,
  ): Flowie<
    Result,
    readonly [NewResult1, NewResult2, NewResult3, NewResult4, NewResult5, NewResult6, NewResult7, NewResult8],
    InitialArgument,
    Context
  >

  (...flowItemsList: readonly FlowItem<Result, any, InitialArgument, Context>[]):
    Flowie<Result, readonly any[], InitialArgument, Context>
}

export type FlowItem<Argument = any, Result = any, InitialArgument = Argument, Context = never> =
  FlowFunction<Argument, Result, Context> | Flowie<Argument, Result, InitialArgument, Context>

export type FlowFunction<Argument = any, Result = any, Context = never> =
  GeneratorFlowFunction<Argument, Result, Context> |
  ((argument: Argument, context: Context) => Promise<Result>) |
  ((argument: Argument, context: Context) => Result)

export type GeneratorFlowFunction<Argument, Result, Context> =
  ((argument: Argument, context: Context) => AsyncGenerator<Result, void>) |
  ((argument: Argument, context: Context) => Generator<Result, void>)

export interface FlowFunctionDetails<Argument = any, Result = any> {
  readonly name: string
  readonly isAsync: boolean
  readonly isGenerator: boolean
}
export interface FlowFunctionDetailsWithItem<Argument = any, Result = any>
  extends FlowFunctionDetails<Argument, Result> {
  readonly flowFunction: FlowFunction<Argument, Result>
}

export interface FunctionReport<Result> {
  readonly result: Result
  readonly functionsReport: ReadonlyMap<string, FlowFunctionResult>
}

export type NoTypedFlowie = Flowie<any, any, any, never>

export type Unpacked<T> = T extends Promise<infer U> ? U : T

export interface RootFlowieCreator {
  <Argument, Result, InitialArgument = Argument, Context = never>(
    flowFunction: FlowFunction<Argument, Result, Context>
  ): Flowie<Argument, Result, InitialArgument, Context>
}

export interface FlowieCreator {
  <Argument, Result, InitialArgument = Argument, Context = never>(
    flowFunction: FlowFunction<Argument, Result, Context>,
    createFlowieRecursion: RootFlowieCreator,
  ): Flowie<Argument, Result, InitialArgument, Context>
}
