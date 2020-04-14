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
    const executeFunction_generatorFunction = flowieContainer.functionsContainer.generatorFunction.flowFunction;
    let result1;
    let reportOnGenerator;
    let iterator1;
    [reportOnGenerator, iterator1] = reporter.reportFunctionCall(executeFunction_generatorFunction, 'generatorFunction', argument);
    reportsList = reportsList.concat(reportOnGenerator);
    let pageReport1 = reporter.startGeneratorReport('generatorFunction');
    for (const itemOfIterator1 of iterator1) {
      pageReport1 = pageReport1.next();
      reportsList = reportsList.concat(pageReport1.report);
      result1 = itemOfIterator1;
    }
    return flowieResult.success(result1, startHRTime, reportsList);
  }
}
