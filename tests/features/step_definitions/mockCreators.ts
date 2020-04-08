import { mock, SinonExpectation } from 'sinon'
import { FlowieContainer } from '../../../src/index'

export function createMock<Argument, Result> (functionName: string, argument: Argument, result: Result) {
  const mockFunction = (mock(functionName) as any as SinonExpectation)
  return mockFunction.atLeast(1).withArgs(argument).returns(result).named(functionName)
}

export function createAsyncMock<Argument, Result> (functionName: string, argument: Argument, result: Result) {
  const mockFunction = (mock(functionName) as any as SinonExpectation)
  const functionCreated = mockFunction.atLeast(1).withArgs(argument).returns(result).named(functionName)
  functionCreated[Symbol.toStringTag] = 'AsyncFunction'
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
