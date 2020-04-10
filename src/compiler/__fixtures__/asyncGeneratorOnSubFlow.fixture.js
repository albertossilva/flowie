function anonymous() {
  function executeFlow_synGeneratorFlow({
    flowieContainer,
    argument
  }) {
    const executeFunction_generatorFunction = flowieContainer.functionsContainer.generatorFunction.flowFunction;
    let result1;
    const iterator1 = executeFunction_generatorFunction(argument);
    for (const itemOfIterator1 of iterator1) {
      result1 = itemOfIterator1;
    }
    return result1;
  }
  async function executeFlow_subAsynGeneratorFlow({
    flowieContainer,
    argument
  }) {
    const executeFunction_asyncGeneratorFunction = flowieContainer.functionsContainer.asyncGeneratorFunction.flowFunction;
    let result1;
    const iterator1 = executeFunction_asyncGeneratorFunction(argument);
    for (const itemOfIterator1 of iterator1) {
      result1 = itemOfIterator1;
    }
    return result1;
  }
  return async function executeMainFlow(executionArguments) {
    const {
      flowieContainer,
      argument,
      createFlowieResult
    } = executionArguments;
    const startTime = Date.now();
    const executeFunction_otherFunction = flowieContainer.functionsContainer.otherFunction.flowFunction;
    const result1 = executeFlow_synGeneratorFlow({
      flowieContainer,
      argument: argument
    });
    const result2 = await executeFlow_subAsynGeneratorFlow({
      flowieContainer,
      argument: result1
    });
    const result3 = executeFunction_otherFunction(result2);
    return createFlowieResult.success(result3, startTime, {});
  }
}
