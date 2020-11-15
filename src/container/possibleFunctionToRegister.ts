import { FlowFunction, FlowFunctionDetailsWithItem, GeneratorFunctionDetails } from '../runtime.types'

type AliasFunction = readonly [string, FlowFunction]
export type PossibleFunctionToRegister = FlowFunction | AliasFunction | GeneratorFunctionDetails

export interface UniqueFunctionDetails {
  readonly functions: ReadonlyMap<FlowFunction, string>
  readonly functionsDetailsList: ReadonlyArray<FlowFunctionDetailsWithItem>
}

export interface FunctionToRegister {
  readonly name: string
  readonly flowFunction: FlowFunction
}

export function getFunctionToRegister(
  uniqueFunctionsDetails: UniqueFunctionDetails,
  candidateToRegister: PossibleFunctionToRegister,
): FunctionToRegister | null {
  if (GeneratorFunctionDetailsRegistration.match(candidateToRegister)) {
    const { name, flowFunction } = GeneratorFunctionDetailsRegistration.getFunctionDetails(
      candidateToRegister as GeneratorFunctionDetails,
    )

    return { name, flowFunction }
  }

  if (AliasFunctionRegistration.match(candidateToRegister)) {
    const { name, flowFunction } = AliasFunctionRegistration.getFunctionDetails(candidateToRegister as AliasFunction)

    return { name, flowFunction }
  }

  if (FlowFunctionRegistration.match(candidateToRegister, uniqueFunctionsDetails)) {
    const { name, flowFunction } = FlowFunctionRegistration.getFunctionDetails(candidateToRegister as FlowFunction)

    return { name, flowFunction }
  }

  return null
}

export function getFlowFunction(
  functionOrGeneratorFunctionDetails: FlowFunction | GeneratorFunctionDetails,
): FlowFunction {
  if (GeneratorFunctionDetailsRegistration.match(functionOrGeneratorFunctionDetails)) {
    const { flowFunction } = GeneratorFunctionDetailsRegistration.getFunctionDetails(
      functionOrGeneratorFunctionDetails as GeneratorFunctionDetails,
    )

    return flowFunction
  }
  return functionOrGeneratorFunctionDetails as FlowFunction
}

const FlowFunctionRegistration = {
  match(candidateToRegister: PossibleFunctionToRegister, uniqueFunctionsDetails: UniqueFunctionDetails) {
    return typeof candidateToRegister === 'function' && !uniqueFunctionsDetails.functions.has(candidateToRegister)
  },
  getFunctionDetails(flowFunction: FlowFunction) {
    const name = getNameForFunction(flowFunction)

    return { name, flowFunction }
  },
}

const AliasFunctionRegistration = {
  match(candidateToRegister: PossibleFunctionToRegister) {
    return Array.isArray(candidateToRegister)
  },
  getFunctionDetails(aliasFunction: AliasFunction) {
    const [alias, flowFunction] = aliasFunction

    return { name: alias, flowFunction }
  },
}

const GeneratorFunctionDetailsRegistration = {
  match(candidateToRegister: PossibleFunctionToRegister) {
    return (
      !Array.isArray(candidateToRegister) &&
      typeof candidateToRegister === 'object' &&
      (candidateToRegister as GeneratorFunctionDetails).generatorFunction
    )
  },
  getFunctionDetails(generatorFunctionDetails: GeneratorFunctionDetails) {
    const name = generatorFunctionDetails.alias || getNameForFunction(generatorFunctionDetails.generatorFunction)

    return { name, flowFunction: generatorFunctionDetails.generatorFunction }
  },
}

function getNameForFunction(flowFunction: FlowFunction): string {
  const randomValue = Math.random().toString(36).slice(2)
  const name = flowFunction.name

  return name || `anonymous_${randomValue}`
}
