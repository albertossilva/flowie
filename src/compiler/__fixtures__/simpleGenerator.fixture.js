function anonymous() {
  return async function executeMainFlow(executionArguments) {
    const {
      flowieContainer,
      argument,
      createFlowieResult
    } = executionArguments;
    const startTime = Date.now();
    const executeFunction_generatorFunction = flowieContainer.functionsContainer.generatorFunction.flowFunction;
    let result1;
    const iterator1 = executeFunction_generatorFunction(argument);
    for (const itemOfIterator1 of iterator1) {
      result1 = itemOfIterator1;
    }
    return createFlowieResult.success(result1, startTime, {});
  }
}
