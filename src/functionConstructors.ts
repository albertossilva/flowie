export function isAsyncFunction (functionCandidate: Function) {
  return functionCandidate[Symbol.toStringTag] === 'AsyncFunction'
}

export function isGeneratorFunction (functionCandidate: Function) {
  return functionCandidate[Symbol.toStringTag] === 'GeneratorFunction'
}

export default Function
