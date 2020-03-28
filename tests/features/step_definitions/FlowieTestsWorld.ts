import { FlowieContainer } from '../../../src/flowieApi'
import { FlowResult } from '../../../src/flowieResult'

export default interface FlowieTestsWorld {
  flowieContainer: FlowieContainer
  flowieResult: FlowResult<string>
}
