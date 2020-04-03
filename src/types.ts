import { Map as ImmutableMap, Set as ImmutableSet } from 'immutable'

import { FlowResult, FlowFunctionResult } from './runtime/flowieResult'
import { FlowieContainer } from './container/createFlowieContainer'

export interface InitializeFlowie {
  <Argument, Result>(flowItem: FlowItem<Argument, Result>): Flowie<Argument, Result>
  <Argument, Result1, Result2>(
    flowItem1: FlowItem<Argument, Result1>,
    flowItem2: FlowItem<Argument, Result2>,
  ): Flowie<Argument, readonly [Result1, Result2]>
  <Argument, Result1, Result2, Result3>(
    flowItem1: FlowItem<Argument, Result1>,
    flowItem2: FlowItem<Argument, Result2>,
    flowItem3: FlowItem<Argument, Result3>,
  ): Flowie<Argument, readonly [Result1, Result2, Result3]>
  <Argument, Result1, Result2, Result3, Result4>(
    flowItem1: FlowItem<Argument, Result1>,
    flowItem2: FlowItem<Argument, Result2>,
    flowItem3: FlowItem<Argument, Result3>,
    flowItem4: FlowItem<Argument, Result4>,
  ): Flowie<Argument, readonly [Result1, Result2, Result3, Result4]>
  <Argument, Result1, Result2, Result3, Result4, Result5>(
    flowItem1: FlowItem<Argument, Result1>,
    flowItem2: FlowItem<Argument, Result2>,
    flowItem3: FlowItem<Argument, Result3>,
    flowItem4: FlowItem<Argument, Result4>,
    flowItem5: FlowItem<Argument, Result5>,
  ): Flowie<Argument, readonly [Result1, Result2, Result3, Result4, Result5]>
  <Argument, Result1, Result2, Result3, Result4, Result5, Result6>(
    flowItem1: FlowItem<Argument, Result1>,
    flowItem2: FlowItem<Argument, Result2>,
    flowItem3: FlowItem<Argument, Result3>,
    flowItem4: FlowItem<Argument, Result4>,
    flowItem5: FlowItem<Argument, Result5>,
    flowItem6: FlowItem<Argument, Result6>,
  ): Flowie<Argument, readonly [Result1, Result2, Result3, Result4, Result5, Result6]>
  <Argument, Result1, Result2, Result3, Result4, Result5, Result6, Result7>(
    flowItem1: FlowItem<Argument, Result1>,
    flowItem2: FlowItem<Argument, Result2>,
    flowItem3: FlowItem<Argument, Result3>,
    flowItem4: FlowItem<Argument, Result4>,
    flowItem5: FlowItem<Argument, Result5>,
    flowItem6: FlowItem<Argument, Result6>,
    flowItem7: FlowItem<Argument, Result7>,
  ): Flowie<Argument, readonly [Result1, Result2, Result3, Result4, Result5, Result6, Result7]>
  <Argument, Result1, Result2, Result3, Result4, Result5, Result6, Result7, Result8>(
    flowItem1: FlowItem<Argument, Result1>,
    flowItem2: FlowItem<Argument, Result2>,
    flowItem3: FlowItem<Argument, Result3>,
    flowItem4: FlowItem<Argument, Result4>,
    flowItem5: FlowItem<Argument, Result5>,
    flowItem6: FlowItem<Argument, Result6>,
    flowItem7: FlowItem<Argument, Result7>,
    flowItem8: FlowItem<Argument, Result8>,
  ): Flowie<Argument, readonly [Result1, Result2, Result3, Result4, Result5, Result6, Result7, Result8]>
  <Argument, Result>(...flowItemsList: readonly FlowItem<Argument, Result>[]): Flowie<Argument, Result>
  <Argument = any, Result = any>(flowieContainer: FlowieContainer, flowExecutionDeclaration: FlowieDeclaration)
}

export interface Flowie<Argument, Result, InitialArgument = Argument>
  extends FlowieExtender<Argument, Result, InitialArgument> {
  (parameter: InitialArgument): FlowResult<Result> | Promise<FlowResult<Result>>
}

export interface FlowieExtender<Argument, Result, InitialArgument = Argument> {
  readonly split: SplitFlowFunction2<Result, InitialArgument>
  readonly pipe: PipeFlowFunction<Result, InitialArgument>
}

export interface PipeFlowFunction<Result, InitialArgument> {
  <NewResult>(flowItem: FlowItem<Result, NewResult>): Flowie<Result, NewResult, InitialArgument>
}

export interface SplitFlowFunction2<Result, InitialArgument> {
  // <NewResult1>(
  //   flowItem1: FlowItem<Result, NewResult1, InitialArgument>
  // ): Flowie<Result, Promise<Unpacked<NewResult1>>, InitialArgument>

  <NewResult1, NewResult2>(
    flowItem1: FlowItem<Result, NewResult1, InitialArgument>,
    flowItem2: FlowItem<Result, NewResult2, InitialArgument>
  ): Flowie<Result, readonly [NewResult1, NewResult2], InitialArgument>

  <NewResult1, NewResult2, NewResult3>(
    flowItem1: FlowItem<Result, NewResult1, InitialArgument>,
    flowItem2: FlowItem<Result, NewResult2, InitialArgument>,
    flowItem3: FlowItem<Result, NewResult3, InitialArgument>,
  ): Flowie<Result, readonly [NewResult1, NewResult2, NewResult3], InitialArgument>

  <NewResult1, NewResult2, NewResult3, NewResult4>(
    flowItem1: FlowItem<Result, NewResult1, InitialArgument>,
    flowItem2: FlowItem<Result, NewResult2, InitialArgument>,
    flowItem3: FlowItem<Result, NewResult3, InitialArgument>,
    flowItem4: FlowItem<Result, NewResult4, InitialArgument>,
  ): Flowie<Result, readonly [NewResult1, NewResult2, NewResult3, NewResult4], InitialArgument>

  <NewResult1, NewResult2, NewResult3, NewResult4, NewResult5>(
    flowItem1: FlowItem<Result, NewResult1, InitialArgument>,
    flowItem2: FlowItem<Result, NewResult2, InitialArgument>,
    flowItem3: FlowItem<Result, NewResult3, InitialArgument>,
    flowItem4: FlowItem<Result, NewResult4, InitialArgument>,
    flowItem5: FlowItem<Result, NewResult5, InitialArgument>,
  ): Flowie<Result, readonly [NewResult1, NewResult2, NewResult3, NewResult4, NewResult5], InitialArgument>

  <NewResult1, NewResult2, NewResult3, NewResult4, NewResult5, NewResult6>(
    flowItem1: FlowItem<Result, NewResult1, InitialArgument>,
    flowItem2: FlowItem<Result, NewResult2, InitialArgument>,
    flowItem3: FlowItem<Result, NewResult3, InitialArgument>,
    flowItem4: FlowItem<Result, NewResult4, InitialArgument>,
    flowItem5: FlowItem<Result, NewResult5, InitialArgument>,
    flowItem6: FlowItem<Result, NewResult6, InitialArgument>,
  ): Flowie<
    Result,
    readonly [NewResult1, NewResult2, NewResult3, NewResult4, NewResult5, NewResult6],
    InitialArgument
  >

  <NewResult1, NewResult2, NewResult3, NewResult4, NewResult5, NewResult6, NewResult7>(
    flowItem1: FlowItem<Result, NewResult1, InitialArgument>,
    flowItem2: FlowItem<Result, NewResult2, InitialArgument>,
    flowItem3: FlowItem<Result, NewResult3, InitialArgument>,
    flowItem4: FlowItem<Result, NewResult4, InitialArgument>,
    flowItem5: FlowItem<Result, NewResult5, InitialArgument>,
    flowItem6: FlowItem<Result, NewResult6, InitialArgument>,
    flowItem7: FlowItem<Result, NewResult7, InitialArgument>,
  ): Flowie<
    Result,
    readonly [NewResult1, NewResult2, NewResult3, NewResult4, NewResult5, NewResult6, NewResult7],
    InitialArgument
  >

  <NewResult1, NewResult2, NewResult3, NewResult4, NewResult5, NewResult6, NewResult7, NewResult8>(
    flowItem1: FlowItem<Result, NewResult1, InitialArgument>,
    flowItem2: FlowItem<Result, NewResult2, InitialArgument>,
    flowItem3: FlowItem<Result, NewResult3, InitialArgument>,
    flowItem4: FlowItem<Result, NewResult4, InitialArgument>,
    flowItem5: FlowItem<Result, NewResult5, InitialArgument>,
    flowItem6: FlowItem<Result, NewResult6, InitialArgument>,
    flowItem7: FlowItem<Result, NewResult7, InitialArgument>,
    flowItem8: FlowItem<Result, NewResult8, InitialArgument>,
  ): Flowie<
    Result,
    readonly [NewResult1, NewResult2, NewResult3, NewResult4, NewResult5, NewResult6, NewResult7, NewResult8],
    InitialArgument
  >

  (...flowItemsList: readonly FlowItem<Result, any, InitialArgument>[]): Flowie<Result, readonly any[], InitialArgument>
}

export type FlowItem<Argument = any, Result = any, InitialArgument = Argument> =
  FlowFunction<Argument, Result> | Flowie<Argument, Result, InitialArgument>

export type FlowFunction<Argument = any, Result = any> =
  GeneratorFlowFunction<Argument, Result> |
  ((argument: Argument) => Promise<Result>) |
  ((argument: Argument) => Result)

export type GeneratorFlowFunction<Argument, Result> =
  ((argument: Argument) => AsyncGenerator<Result, void>) |
  ((argument: Argument) => Generator<Result, void>)

export interface FlowFunctionDetails<Argument = any, Result = any> {
  readonly name: string
  readonly isAsync: boolean
}
export interface FlowFunctionDetailsWithItem<Argument = any, Result = any>
  extends FlowFunctionDetails<Argument, Result> {
  readonly flowItem: FlowItem<Argument, Result>
}

export interface FunctionReport<Result> {
  readonly result: Result
  readonly functionsReport: ImmutableMap<string, FlowFunctionResult>
}

export type NoTypedFlowie = Flowie<any, any>

export type Unpacked<T> = T extends Promise<infer U> ? U : T

export interface RootFlowieCreator {
  <Argument, Result, InitialArgument = Argument>(
    flowFunction: FlowFunction<Argument, Result>
  ): Flowie<Argument, Result, InitialArgument>
}

export interface FlowieCreator {
  <Argument, Result, InitialArgument = Argument>(
    flowFunction: FlowFunction<Argument, Result>,
    createFlowieRecursion: RootFlowieCreator,
  ): Flowie<Argument, Result, InitialArgument>
}

export interface FlowieDeclaration {
  readonly flows: Flows
}

export interface FlowieExecutionDeclaration extends FlowieDeclaration {
  readonly isAsync: boolean
  readonly allFunctionsNames: ImmutableSet<string>
}

export type Flows = readonly (PipeFlow | SplitFlow)[]

export interface PipeFlow {
  readonly pipe: {
    readonly function: FlowieItemDeclaration
  }
}

export interface SplitFlow {
  readonly split: {
    readonly functions: readonly FlowieItemDeclaration[]
  }
}

export type FlowieItemDeclaration = string
