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
    const executeFunction_otherFunction = flowieContainer.functionsContainer.otherFunction.flowFunction;
    let reportOnGenerator;
    let result1;
    let result2;
    let iterator1;
    [reportOnGenerator, iterator1] = reporter.reportFunctionCall(executeFunction_generatorFunction, 'generatorFunction', argument);
    reportsList = reportsList.concat(reportOnGenerator);
    let pageReport1 = reporter.startGeneratorReport('generatorFunction');
    for (const itemOfIterator1 of iterator1) {
      pageReport1 = pageReport1.pageDone();
      reportsList = reportsList.concat(pageReport1.report);
      result1 = itemOfIterator1;
      [reportOnGenerator, result2] = reporter.reportFunctionCall(executeFunction_otherFunction, 'otherFunction', result1);
      reportsList = reportsList.concat(reportOnGenerator);
      pageReport1 = pageReport1.prepareNext();
    }
    return flowieResult.success(result2, startHRTime, reportsList);
  }
}
