// import { Then } from 'cucumber'
// import { assert } from 'chai'

// import FlowieTestsWorld from './FlowieTestsWorld'

// import { FlowFunctionResult } from '../../../src/flowieResult'

// Then('the final execution time result will be about {int} millisecond\\(s)', function (this: FlowieTestsWorld, executionTime: number) {
//   assert.approximately(this.flowieResult.executionTime, executionTime, 15, 'The execution time was not computed right')
// })

// Then('the execution time of function {string} is about {int} millisecond\\(s)',
//   function (this: FlowieTestsWorld, functionName: string, executionTime: number) {
//     const functionResult = this.flowieResult.functions[functionName] as FlowFunctionResult
//     assert.approximately(functionResult.executionTime, executionTime, 10, `The execution time was not computed right for the function ${functionName}`)
//   }
// )
