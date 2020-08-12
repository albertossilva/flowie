import { mock, stub, SinonExpectation } from 'sinon'
import { FlowieContainer } from '../../../src/index'

export function createMock<Argument, Result> (functionName: string, argument: Argument, result: Result) {
  const mockFunction = (mock(functionName) as any as SinonExpectation)
  return mockFunction.atLeast(1).withArgs(argument).returns(result).named(functionName)
}

export function createByPassMock (functionName: string) {
  const mockFunction = stub().named(functionName).returnsArg(0)
  return mockFunction
}

export function createAsyncMock<Argument, Result> (functionName: string, argument: Argument, result: Result) {
  const mockFunction = (mock(functionName) as any as SinonExpectation)
  const functionCreated = mockFunction.atLeast(1).withArgs(argument).returns(result).named(functionName)
  functionCreated[Symbol.toStringTag] = 'AsyncFunction'

  return functionCreated
}

export function createGeneratorMock<Argument, YieldType> (
  functionName: string,
  argument: Argument,
  yieldsList: ReadonlyArray<YieldType>
) {
  const iterator = yieldsList[Symbol.iterator]()
  const mockFunction = (mock(functionName) as any as SinonExpectation)
  const functionCreated = mockFunction.atLeast(1).withArgs(argument).returns(iterator).named(functionName)
  functionCreated[Symbol.toStringTag] = 'GeneratorFunction'

  return functionCreated
}

export function createAsyncGeneratorMock<Argument, YieldType> (
  functionName: string,
  argument: Argument,
  yieldsList: ReadonlyArray<YieldType>
) {
  const functionCreated = createGeneratorMock(functionName, argument, yieldsList)
  functionCreated[Symbol.toStringTag] = 'AsyncGeneratorFunction'

  return functionCreated
}

export function registerMockFunction<Argument, Result> (
  flowieContainer: FlowieContainer,
  functionName: string,
  argument: Argument,
  result: Result
) {
  return flowieContainer.register([functionName, createMock(functionName, argument, result)])
}

export function registerAsyncMockFunction<Argument, Result> (
  flowieContainer: FlowieContainer,
  functionName: string,
  argument: Argument,
  result: Result
) {
  return flowieContainer.register([functionName, createAsyncMock(functionName, argument, result)])
}

export function registerGeneratorMockFunction<Argument, YieldType> (
  flowieContainer: FlowieContainer,
  functionName: string,
  argument: Argument,
  yieldsList: ReadonlyArray<YieldType>
) {
  return flowieContainer.register([functionName, createGeneratorMock(functionName, argument, yieldsList)])
}

export function registerGeneratorMockFunctionForObject<Argument, YieldType> (
  flowieContainer: FlowieContainer,
  functionName: string,
  keyYields: Record<string, ReadonlyArray<YieldType>>
) {
  const mockFunction = stub().named(functionName)
  for (const [key, yieldsList] of Object.entries(keyYields)) {
    const iterator = yieldsList[Symbol.iterator]()
    mockFunction.withArgs(key).returns(iterator)
  }
  mockFunction.named(functionName)
  mockFunction[Symbol.toStringTag] = 'GeneratorFunction'

  return flowieContainer.register([functionName, mockFunction])
}
