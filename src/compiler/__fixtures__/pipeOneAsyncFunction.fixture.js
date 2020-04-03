async function anonymous(executionArguments) {
  const {
    flowieContainer,
    argument,
    createFlowieResult
  } = executionArguments;
  const startTime = Date.now();
  const executeFunction_firstFlowieItem = flowieContainer.functionsContainer.firstFlowieItem.flowItem;
  const result1 = await executeFunction_firstFlowieItem(argument);
  return createFlowieResult.success(result1, startTime, {});
}
