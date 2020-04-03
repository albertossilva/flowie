const functionConstructors = {
  /* instanbul ignore next */
  sync: (() => 1).constructor as FunctionConstructor,
  /* instanbul ignore next */
  async: (async () => 1).constructor as FunctionConstructor
}

export function isAsyncFunction (functionCandidate: Function) {
  return functionCandidate[Symbol.toStringTag] === 'AsyncFunction'
}

export default functionConstructors
