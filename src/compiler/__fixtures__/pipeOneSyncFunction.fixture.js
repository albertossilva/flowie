function anonymous(separateReportListFromResult) {
  return function executeMainFlow(executionArguments) {
    const {
      flowieContainer,
      argument,
      flowieResult,
      reporter
    } = executionArguments;
    let reportsList = [];
    const startHRTime = process.hrtime();
    const executeFunction_firstFlowieItem = flowieContainer.functionsContainer.firstFlowieItem.flowFunction;
    const [report1, result1] = reporter.reportFunctionCall(executeFunction_firstFlowieItem, 'firstFlowieItem', argument);
    reportsList = reportsList.concat(report1);
    return flowieResult.success(result1, startHRTime, reportsList);
  }
}
