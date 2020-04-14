function anonymous(separateReportListFromResult) {
  async function executeFlow_subFlowLevel1({
    flowieContainer,
    reporter,
    argument
  }) {
    let reportsList = [];
    const executeFunction_secondFlowieItem = flowieContainer.functionsContainer.secondFlowieItem.flowFunction;
    const [report1, result1] = await reporter.reportAsyncFunctionCall(executeFunction_secondFlowieItem, 'secondFlowieItem', argument);
    reportsList = reportsList.concat(report1);
    const [report2, result2] = executeFlow_subFlowLevel2({
      flowieContainer,
      reporter,
      argument: result1
    });
    reportsList = reportsList.concat(report2);
    return [reportsList, result2];
  }

  function executeFlow_subFlowLevel2({
    flowieContainer,
    reporter,
    argument
  }) {
    let reportsList = [];
    const executeFunction_thirdFlowieItem = flowieContainer.functionsContainer.thirdFlowieItem.flowFunction;
    const [report1, result1] = reporter.reportFunctionCall(executeFunction_thirdFlowieItem, 'thirdFlowieItem', argument);
    reportsList = reportsList.concat(report1);
    return [reportsList, result1];
  }
  return async function executeMainFlow(executionArguments) {
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
    const [report2, result2] = await executeFlow_subFlowLevel1({
      flowieContainer,
      reporter,
      argument: result1
    });
    reportsList = reportsList.concat(report2);
    return flowieResult.success(result2, startHRTime, reportsList);
  }
}
