function anonymous() {
  return async function executeMainFlow(executionArguments) {
    const {
      flowieContainer,
      argument,
      createFlowieResult
    } = executionArguments;
    const startTime = Date.now();
    const executeFunction_splitOne = flowieContainer.functionsContainer.splitOne.flowFunction;
    const executeFunction_splitTwo = flowieContainer.functionsContainer.splitTwo.flowFunction;
    const result1 = await Promise.all([executeFunction_splitOne(argument), executeFunction_splitTwo(argument), ]);
    return createFlowieResult.success(result1, startTime, {});
  }
}
