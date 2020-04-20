import { expect } from 'chai'
import { mock } from 'sinon'
import { lorem } from 'faker'

import {
  reportFunctionCall,
  reportAsyncFunctionCall,
  reportFunctionCallContext,
  reportAsyncFunctionCallContext,
  startGeneratorReport,
  calculateHRTimeDifference,
  compactFunctionReport
} from '../reporter'
import { HRTime } from '../reporter.types'

const argument = lorem.word()
const contextArgument = lorem.word()
const expectedResult = lorem.word()

describe('reporter/reporter', function () {
  describe('#reportFunctionCall', function () {
    before(function () {
      const mockedFunction = mock().withExactArgs(argument).returns(expectedResult).named('functionToReport')

      const [report, result] = reportFunctionCall(mockedFunction, 'functionToReport', argument)
      this.actualResult = result
      this.actualReport = report
    })

    it('returns the function result', function () {
      expect(this.actualResult).to.equal(expectedResult)
    })

    it('reports the execution time', function () {
      expect(this.actualReport.functionName).to.equal('functionToReport')
      expect(this.actualReport.executionTime).to.greaterThan(0)
    })
  })

  describe('#reportFunctionCallContext', function () {
    before(function () {
      const mockedFunction = mock()
        .withExactArgs(argument, contextArgument)
        .returns(expectedResult)
        .named('functionToReport')

      const [report, result] = reportFunctionCallContext(mockedFunction, 'functionToReport', argument, contextArgument)
      this.actualResult = result
      this.actualReport = report
    })

    it('returns the function result', function () {
      expect(this.actualResult).to.equal(expectedResult)
    })

    it('reports the execution time', function () {
      expect(this.actualReport.functionName).to.equal('functionToReport')
      expect(this.actualReport.executionTime).to.greaterThan(0)
    })
  })

  describe('#reportAsyncFunctionCall', function () {
    before(async function () {
      const mockedFunction = mock().withExactArgs(argument).resolves(expectedResult).named('asyncFunctionToReport')

      const [report, result] = await reportAsyncFunctionCall(mockedFunction, 'asyncFunctionToReport', argument)
      this.actualResult = result
      this.actualReport = report
    })
    it('returns the function result', function () {
      expect(this.actualResult).to.equal(expectedResult)
    })

    it('reports the execution time', function () {
      expect(this.actualReport.functionName).to.equal('asyncFunctionToReport')
      expect(this.actualReport.executionTime).to.greaterThan(0)
    })
  })

  describe('#reportAsyncFunctionCallContext', function () {
    before(async function () {
      const mockedFunction = mock()
        .withExactArgs(argument, contextArgument)
        .resolves(expectedResult)
        .named('functionToReport')

      const [report, result] =
        await reportAsyncFunctionCallContext(mockedFunction, 'functionToReport', argument, contextArgument)
      this.actualResult = result
      this.actualReport = report
    })

    it('returns the function result', function () {
      expect(this.actualResult).to.equal(expectedResult)
    })

    it('reports the execution time', function () {
      expect(this.actualReport.functionName).to.equal('functionToReport')
      expect(this.actualReport.executionTime).to.greaterThan(0)
    })
  })

  describe('#startGeneratorReport', function () {
    it('generates next generate report page according to previous', async function () {
      const functionName = lorem.word()
      const generatorReporter = startGeneratorReport(functionName)
      expect(generatorReporter.report.functionName).to.equal(functionName)
      expect(generatorReporter.report.iterationTime).to.equal(0)

      const iteration1 = generatorReporter.next()
      expect(iteration1.report.functionName).to.equal(functionName)
      expect(iteration1.report.iterationTime).to.greaterThan(0)

      await sleep(10)

      const iteration2 = generatorReporter.next()
      expect(iteration2.report.functionName).to.equal(functionName)
      expect(iteration2.report.iterationTime).to.greaterThan(9)
    })
  })

  describe('#calculateHRTimeDifference', function () {
    it('calculates the different including the nano seconds', async function () {
      const initialTime = process.hrtime()
      await sleep(10)
      const actual = calculateHRTimeDifference(initialTime)

      expect(actual).to.least(9)
      expect(actual).to.not.equal(Math.floor(actual)) // isInteger
    })
  })

  describe('#compactFunctionReport', function () {
    before(function () {
      const not = 0
      const used = 0
      const hrTime: HRTime = [not, used]
      this.compactedFunctionReport = compactFunctionReport([
        { functionName: 'calledOnce', executionTime: 5 },
        { functionName: 'calledTwice', executionTime: 10 },
        { functionName: 'calledTwice', executionTime: 20 },
        { functionName: 'calledTwice', iterationTime: 10, hrTime },
        { functionName: 'calledTwice', iterationTime: 20, hrTime },
        { functionName: 'calledThrice', executionTime: 20 },
        { functionName: 'calledThrice', executionTime: 40 },
        { functionName: 'calledThrice', executionTime: 60 },
        { functionName: 'calledThrice', iterationTime: 20, hrTime },
        { functionName: 'calledThrice', iterationTime: 40, hrTime },
        { functionName: 'calledThrice', iterationTime: 60, hrTime }
      ])
    })

    context('on function calledOnce', function () {
      it('count 1 calls', function () {
        expect(this.compactedFunctionReport.calledOnce).to.haveOwnProperty('calls', 1)
      })
      it('calculates 5 as slowest execution', function () {
        expect(this.compactedFunctionReport.calledOnce).to.haveOwnProperty('slowestExecutionTime', 5)
      })
      it('calculates 5 as fastest execution', function () {
        expect(this.compactedFunctionReport.calledOnce).to.haveOwnProperty('fastestExecutionTime', 5)
      })
      it('calculates 5 as average execution', function () {
        expect(this.compactedFunctionReport.calledOnce).to.haveOwnProperty('averageExecutionTime', 5)
      })
      it('calculates 5 as total execution', function () {
        expect(this.compactedFunctionReport.calledOnce).to.haveOwnProperty('totalExecutionTime', 5)
      })
      it('has no iterations', function () {
        expect(this.compactedFunctionReport.calledOnce).to.not.haveOwnProperty('iterations')
      })
    })

    context('on function calledTwice', function () {
      it('count 2 calls', function () {
        expect(this.compactedFunctionReport.calledTwice).to.haveOwnProperty('calls', 2)
      })
      it('calculates 20 as slowest execution', function () {
        expect(this.compactedFunctionReport.calledTwice).to.haveOwnProperty('slowestExecutionTime', 20)
      })
      it('calculates 10 as fastest execution', function () {
        expect(this.compactedFunctionReport.calledTwice).to.haveOwnProperty('fastestExecutionTime', 10)
      })
      it('calculates 15 as average execution', function () {
        expect(this.compactedFunctionReport.calledTwice).to.haveOwnProperty('averageExecutionTime', 15)
      })
      it('calculates 30 as total execution', function () {
        expect(this.compactedFunctionReport.calledTwice).to.haveOwnProperty('totalExecutionTime', 30)
      })

      it('count 2 iterations', function () {
        expect(this.compactedFunctionReport.calledTwice.iterations).to.haveOwnProperty('count', 2)
      })
      it('calculates 20 as slowest iteration', function () {
        expect(this.compactedFunctionReport.calledTwice.iterations).to.haveOwnProperty('slowestIterationTime', 20)
      })
      it('calculates 10 as fastest iteration', function () {
        expect(this.compactedFunctionReport.calledTwice.iterations).to.haveOwnProperty('fastestIterationTime', 10)
      })
      it('calculates 15 as average iteration', function () {
        expect(this.compactedFunctionReport.calledTwice.iterations).to.haveOwnProperty('averageIterationTime', 15)
      })
      it('calculates 30 as total iteration', function () {
        expect(this.compactedFunctionReport.calledTwice.iterations).to.haveOwnProperty('totalIterationTime', 30)
      })
    })

    context('on function calledThrice', function () {
      it('count 3 calls', function () {
        expect(this.compactedFunctionReport.calledThrice).to.haveOwnProperty('calls', 3)
      })
      it('calculates 60 as slowest execution', function () {
        expect(this.compactedFunctionReport.calledThrice).to.haveOwnProperty('slowestExecutionTime', 60)
      })
      it('calculates 20 as fastest execution', function () {
        expect(this.compactedFunctionReport.calledThrice).to.haveOwnProperty('fastestExecutionTime', 20)
      })
      it('calculates 40 as average execution', function () {
        expect(this.compactedFunctionReport.calledThrice).to.haveOwnProperty('averageExecutionTime', 40)
      })
      it('calculates 120 as total execution', function () {
        expect(this.compactedFunctionReport.calledThrice).to.haveOwnProperty('totalExecutionTime', 120)
      })

      it('count 3 iterations', function () {
        expect(this.compactedFunctionReport.calledThrice.iterations).to.haveOwnProperty('count', 3)
      })
      it('calculates 60 as slowest iteration', function () {
        expect(this.compactedFunctionReport.calledThrice.iterations).to.haveOwnProperty('slowestIterationTime', 60)
      })
      it('calculates 20 as fastest iteration', function () {
        expect(this.compactedFunctionReport.calledThrice.iterations).to.haveOwnProperty('fastestIterationTime', 20)
      })
      it('calculates 40 as average iteration', function () {
        expect(this.compactedFunctionReport.calledThrice.iterations).to.haveOwnProperty('averageIterationTime', 40)
      })
      it('calculates 120 as total iteration', function () {
        expect(this.compactedFunctionReport.calledThrice.iterations).to.haveOwnProperty('totalIterationTime', 120)
      })
    })
  })
})

const sleep = (timeMS: number) => new Promise((resolve: (value: number) => void) => setTimeout(resolve, timeMS))
