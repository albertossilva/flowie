function anonymous() {
  return async function executeMainFlow(executionArguments) {
    const {
      flowieContainer,
      argument,
      createFlowieResult
    } = executionArguments;
    const startTime = Date.now();
    const executeFunction_firstFlowieItem = flowieContainer.functionsContainer.firstFlowieItem.flowFunction;
    const result1 = await executeFunction_firstFlowieItem(argument);
    return createFlowieResult.success(result1, startTime, {});
  }
}
