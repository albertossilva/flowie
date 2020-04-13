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
    const executeFunction_generatorFunction = flowieContainer.functionsContainer.generatorFunction.flowFunction;
    let result1;
    let reportOnGenerator;
    let iterator1;
    [reportOnGenerator, iterator1] = reporter.reportFunctionCall(executeFunction_generatorFunction, 'generatorFunction', argument);
    reportsList = reportsList.concat(reportOnGenerator);
    for (const itemOfIterator1 of iterator1) {
      result1 = itemOfIterator1;
    }
    return flowieResult.success(result1, startTime, reportsList);
  }
}
