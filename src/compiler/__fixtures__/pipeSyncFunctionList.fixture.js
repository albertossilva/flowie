function anonymous() {
  return function executeMainFlow(executionArguments) {
    const {
      flowieContainer,
      argument,
      createFlowieResult
    } = executionArguments;
    const startTime = Date.now();
    const executeFunction_firstFlowieItem = flowieContainer.functionsContainer.firstFlowieItem.flowFunction;
    const executeFunction_secondFlowieItem = flowieContainer.functionsContainer.secondFlowieItem.flowFunction;
    const executeFunction_thirdFlowieItem = flowieContainer.functionsContainer.thirdFlowieItem.flowFunction;
    const result1 = executeFunction_firstFlowieItem(argument);
    const result2 = executeFunction_secondFlowieItem(result1);
    const result3 = executeFunction_thirdFlowieItem(result2);
    return createFlowieResult.success(result3, startTime, {});
  }
}
