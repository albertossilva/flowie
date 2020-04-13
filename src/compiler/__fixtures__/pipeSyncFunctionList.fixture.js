function anonymous(separateReportListFromResult) {
  return function executeMainFlow(executionArguments) {
    const {
      flowieContainer,
      argument,
      flowieResult,
      reporter
    } = executionArguments;
    let reportsList = [];
    const startTime = Date.now();
    const executeFunction_firstFlowieItem = flowieContainer.functionsContainer.firstFlowieItem.flowFunction;
    const executeFunction_secondFlowieItem = flowieContainer.functionsContainer.secondFlowieItem.flowFunction;
    const executeFunction_thirdFlowieItem = flowieContainer.functionsContainer.thirdFlowieItem.flowFunction;
    const [report1, result1] = reporter.reportFunctionCall(executeFunction_firstFlowieItem, 'firstFlowieItem', argument);
    reportsList = reportsList.concat(report1);
    const [report2, result2] = reporter.reportFunctionCall(executeFunction_secondFlowieItem, 'secondFlowieItem', result1);
    reportsList = reportsList.concat(report2);
    const [report3, result3] = reporter.reportFunctionCall(executeFunction_thirdFlowieItem, 'thirdFlowieItem', result2);
    reportsList = reportsList.concat(report3);
    return flowieResult.success(result3, startTime, reportsList);
  }
}
