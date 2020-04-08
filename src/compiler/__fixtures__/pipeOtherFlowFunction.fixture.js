function anonymous() {
  async function executeFlow_subFlowLevel1({
    flowieContainer,
    argument
  }) {
    const executeFunction_secondFlowieItem = flowieContainer.functionsContainer.secondFlowieItem.flowFunction;
    const result1 = await executeFunction_secondFlowieItem(argument);
    const result2 = executeFlow_subFlowLevel2({
      flowieContainer,
      argument: result1
    });
    return result2;
  }

  function executeFlow_subFlowLevel2({
    flowieContainer,
    argument
  }) {
    const executeFunction_thirdFlowieItem = flowieContainer.functionsContainer.thirdFlowieItem.flowFunction;
    const result1 = executeFunction_thirdFlowieItem(argument);
    return result1;
  }
  return async function executeMainFlow(executionArguments) {
    const {
      flowieContainer,
      argument,
      createFlowieResult
    } = executionArguments;
    const startTime = Date.now();
    const executeFunction_firstFlowieItem = flowieContainer.functionsContainer.firstFlowieItem.flowFunction;
    const result1 = executeFunction_firstFlowieItem(argument);
    const result2 = await executeFlow_subFlowLevel1({
      flowieContainer,
      argument: result1
    });
    return createFlowieResult.success(result2, startTime, {});
  }
}
