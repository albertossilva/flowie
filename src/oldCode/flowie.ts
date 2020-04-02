// import { Flowie, FlowItem, FlowFunction, InitializeFlowie, FlowieCreator } from './flowie.type'

// import createFlowieForSimpleFunction from './createFlowieForSimpleFunction'
// import createFlowieForGenerator from './createFlowieForGenerator'
// import convertFlowItemToFlowFunction from './convertFlowItemToFlowFunction'
// import createSplitFlow from './createSplitFlow'
// import { isFlowieFunction } from './flowieFunctionSymbol'

// export const flowie = initializeflowie as InitializeFlowie

// function initializeflowie<Argument, Result> (
//   ...flowItemsList: readonly FlowItem<Argument, Result>[]
// ): Flowie<Argument, Result> {
//   const shouldPipe = flowItemsList.length === 1

//   if (shouldPipe) return createFlowieFromFunction(flowItemsList[0])

//   const flowieFromFunctionList = flowItemsList.map(convertFlowItemToFlowFunction)
//   const splittedFlowFunction = createSplitFlow(flowieFromFunctionList)
//   return createFlowie(splittedFlowFunction as any as FlowFunction<Argument, Result>)
// }

// function createFlowieFromFunction<Argument, Result> (flowItem: FlowItem<Argument, Result>) {
//   if (isFlowieFunction(flowItem)) {
//     return flowItem as Flowie<Argument, Result>
//   }

//   return createFlowie(flowItem as FlowFunction<Argument, Result>)
// }

// function createFlowie<Argument, Result, InitialArgument = Argument> (
//   flowFunction: FlowFunction<Argument, Result>
// ): Flowie<Argument, Result, InitialArgument> {
//   const stringTag = flowFunction[Symbol.toStringTag]

//   const flowieCreator = stringTag ? flowieCreatorsByStringTag[stringTag] : flowieCreatorsByStringTag.Function

//   return flowieCreator(flowFunction, createFlowie)
// }

// const flowieCreatorsByStringTag: Record<string, FlowieCreator> = {
//   Function: createFlowieForSimpleFunction,
//   AsyncFunction: createFlowieForSimpleFunction,
//   GeneratorFunction: createFlowieForGenerator,
//   AsyncGeneratorFunction: createFlowieForGenerator
// }
