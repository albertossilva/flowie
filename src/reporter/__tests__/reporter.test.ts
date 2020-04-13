import { expect } from 'chai'
import { mock } from 'sinon'
import { lorem } from 'faker'

import { reportFunctionCall, reportAsyncFunctionCall } from '../reporter'

describe('reporter/reporter', function () {
  describe('#reportFunctionCall', function () {
    before(function () {
      const argument = lorem.word()
      this.expectedResult = lorem.word()
      const mockedFunction = mock().withExactArgs(argument).returns(this.expectedResult).named('functionToReport')

      const [report, result] = reportFunctionCall(mockedFunction, 'functionToReport', argument)
      this.actualResult = result
      this.actualReport = report
    })
    it('returns the function result', function () {
      expect(this.actualResult).to.equal(this.expectedResult)
    })
    it('reports the execution time', function () {
      expect(this.actualReport.functionName).to.equal('functionToReport')
      expect(this.actualReport.executionTime).to.within(0, 2)
    })
  })

  describe('#reportAsyncFunctionCall', function () {
    before(async function () {
      const argument = lorem.word()
      this.expectedResult = lorem.word()
      const mockedFunction = mock().withExactArgs(argument).resolves(this.expectedResult).named('asyncFunctionToReport')

      const [report, result] = await reportAsyncFunctionCall(mockedFunction, 'asyncFunctionToReport', argument)
      this.actualResult = result
      this.actualReport = report
    })
    it('returns the function result', function () {
      expect(this.actualResult).to.equal(this.expectedResult)
    })
    it('reports the execution time', function () {
      expect(this.actualReport.functionName).to.equal('asyncFunctionToReport')
      expect(this.actualReport.executionTime).to.within(0, 2)
    })
  })
})
