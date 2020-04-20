const asyncFunctionsStringTag = ['AsyncFunction', 'AsyncGeneratorFunction']
const generatorFunctionsStringTag = ['GeneratorFunction', 'AsyncGeneratorFunction']

export function isAsyncFunction (functionCandidate: unknown): boolean {
  return asyncFunctionsStringTag.includes(functionCandidate[Symbol.toStringTag])
}

export function isGeneratorFunction (functionCandidate: unknown): boolean {
  return generatorFunctionsStringTag.includes(functionCandidate[Symbol.toStringTag])
}

export default Function
