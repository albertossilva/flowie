function anonymous(separateReportListFromResult) {
  function executeFlow_generator_on_split_generatorFunction({
    flowieContainer,
    reporter,
    argument
  }) {
    let reportsList = [];
    const executeFunction_generatorFunction = flowieContainer.functionsContainer.generatorFunction.flowFunction;
    let result1;
    let reportOnGenerator;
    let iterator1;
    [reportOnGenerator, iterator1] = reporter.reportFunctionCall(executeFunction_generatorFunction, 'generatorFunction', argument);
    reportsList = reportsList.concat(reportOnGenerator);
    for (const itemOfIterator1 of iterator1) {
      result1 = itemOfIterator1;
    }
    return [reportsList, result1];
  }
  async function executeFlow_subAsyncGeneratorFlow({
    flowieContainer,
    reporter,
    argument
  }) {
    let reportsList = [];
    const executeFunction_asyncGeneratorFunction = flowieContainer.functionsContainer.asyncGeneratorFunction.flowFunction;
    let result1;
    let reportOnGenerator;
    let iterator1;
    [reportOnGenerator, iterator1] = await reporter.reportAsyncFunctionCall(executeFunction_asyncGeneratorFunction, 'asyncGeneratorFunction', argument);
    reportsList = reportsList.concat(reportOnGenerator);
    for await (const itemOfIterator1 of iterator1) {
      result1 = itemOfIterator1;
    }
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
    const startTime = Date.now();
    const executeFunction_otherFunction = flowieContainer.functionsContainer.otherFunction.flowFunction;
    const splittingResult1 = [executeFlow_generator_on_split_generatorFunction({
      flowieContainer,
      reporter,
      argument: argument
    }), ];
    const [report1, result1] = separateReportListFromResult(splittingResult1);
    reportsList = reportsList.concat(report1);
    const [report2, result2] = await executeFlow_subAsyncGeneratorFlow({
      flowieContainer,
      reporter,
      argument: result1
    });
    reportsList = reportsList.concat(report2);
    const [report3, result3] = reporter.reportFunctionCall(executeFunction_otherFunction, 'otherFunction', result2);
    reportsList = reportsList.concat(report3);
    return flowieResult.success(result3, startTime, reportsList);
  }
}
