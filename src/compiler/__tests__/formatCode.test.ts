import { expect } from 'chai'

import formatCode from '../formatCode'

describe('compiler/formatCode', function () {
  // eslint-disable-next-line max-len
  const sourceCode = 'function executeFlow_syncGeneratorFlow({ flowieContainer, argument }) {  const executeFunction_generatorFunction = flowieContainer.functionsContainer.generatorFunction.flowFunction;    let result1;         const iterator1 = executeFunction_generatorFunction(argument); for (const itemOfIterator1 of iterator1) { result1 = itemOfIterator1;   }  return result1; }     async function executeFlow_subAsyncGeneratorFlow({ flowieContainer, argument }) {  const executeFunction_asyncGeneratorFunction = flowieContainer.functionsContainer.asyncGeneratorFunction.flowFunction;    let result1;         const iterator1 = executeFunction_asyncGeneratorFunction(argument); for await(const itemOfIterator1 of iterator1) { result1 = itemOfIterator1;   }  return result1; }return async function executeMainFlow(executionArguments) {  const { flowieContainer, argument, flowieResult } = executionArguments; const startTime = Date.now();  const executeFunction_otherFunction = flowieContainer.functionsContainer.otherFunction.flowFunction;       const result1 = executeFlow_syncGeneratorFlow({ flowieContainer, argument: argument });     const result2 = await executeFlow_subAsyncGeneratorFlow({ flowieContainer, argument: result1 });     const result3 = executeFunction_otherFunction(result2);  return createFlowieResult.success(result3, startTime, {});}'
  const formattedCode = `function executeFlow_syncGeneratorFlow({flowieContainer, argument}){
  const executeFunction_generatorFunction = flowieContainer.functionsContainer.generatorFunction.flowFunction;
  let result1;
  const iterator1 = executeFunction_generatorFunction(argument);
  for (const itemOfIterator1 of iterator1){
    result1 = itemOfIterator1;
  }
  return result1;
}
async function executeFlow_subAsyncGeneratorFlow({flowieContainer, argument}){
  const executeFunction_asyncGeneratorFunction = flowieContainer.functionsContainer.asyncGeneratorFunction.flowFunction;
  let result1;
  const iterator1 = executeFunction_asyncGeneratorFunction(argument);
  for await(const itemOfIterator1 of iterator1){
    result1 = itemOfIterator1;
  }
  return result1;
}
return async function executeMainFlow(executionArguments){
  const {flowieContainer, argument, flowieResult}= executionArguments;
  const startTime = Date.now();
  const executeFunction_otherFunction = flowieContainer.functionsContainer.otherFunction.flowFunction;
  const result1 = executeFlow_syncGeneratorFlow({flowieContainer, argument: argument});
  const result2 = await executeFlow_subAsyncGeneratorFlow({flowieContainer, argument: result1});
  const result3 = executeFunction_otherFunction(result2);
  return createFlowieResult.success(result3, startTime, {});
}
`

  it('do not format if debug is not enabled', function () {
    const actual = formatCode(sourceCode, false)

    expect(actual).to.equal(sourceCode)
  })

  it('format just to enable to identify the blocks when debug', function () {
    const actual = formatCode(sourceCode, true)

    expect(actual).to.equal(formattedCode)
  })
})
