const asyncFunctionsStringTag = ['AsyncFunction', 'AsyncGeneratorFunction']
const generatorFunctionsStringTag = ['GeneratorFunction', 'AsyncGeneratorFunction']

export function isAsyncFunction (functionCandidate: Function) {
  return asyncFunctionsStringTag.includes(functionCandidate[Symbol.toStringTag])
}

export function isGeneratorFunction (functionCandidate: Function) {
  return generatorFunctionsStringTag.includes(functionCandidate[Symbol.toStringTag])
}

export default Function
