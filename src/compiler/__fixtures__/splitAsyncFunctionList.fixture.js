function anonymous(separateReportListFromResult) {
  return async function executeMainFlow(executionArguments) {
    const {
      flowieContainer,
      argument,
      flowieResult,
      reporter
    } = executionArguments;
    let reportsList = [];
    const startTime = Date.now();
    const executeFunction_splitOne = flowieContainer.functionsContainer.splitOne.flowFunction;
    const executeFunction_splitTwo = flowieContainer.functionsContainer.splitTwo.flowFunction;
    const splittingResult1 = await Promise.all([reporter.reportAsyncFunctionCall(executeFunction_splitOne, 'splitFunction', argument), reporter.reportAsyncFunctionCall(executeFunction_splitTwo, 'splitFunction', argument), ]);
    const [report1, result1] = separateReportListFromResult(splittingResult1);
    reportsList = reportsList.concat(report1);
    return flowieResult.success(result1, startTime, reportsList);
  }
}
