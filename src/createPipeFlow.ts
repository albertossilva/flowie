import { FlowFunction } from './flowie.type'

export default function createPipeFlow<Argument, Result, NewResult> (
  previousFlowFunction: FlowFunction<Argument, Result>,
  flowFunction: FlowFunction<Result, NewResult>
) {
  async function executePipeFlow (argument: Argument): Promise<NewResult> {
    const previousResult = await previousFlowFunction(argument) as Result
    return flowFunction(previousResult) as NewResult
  }

  return executePipeFlow as FlowFunction<Argument, NewResult>
}
