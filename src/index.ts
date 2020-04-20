import createFlowie from './runtime/createFlowie'

import createFlowieContainer from './container/createFlowieContainer'
/* istanbul ignore next */
export { default as createFlowieContainer, FlowieContainer } from './container/createFlowieContainer'

export default createFlowie
export * from './runtime.types'
export * from './prepared.types'
export { FlowFunctionsResultList, FlowFunctionResult } from './reporter/reporter.types'
export { FlowResult } from './runtime/flowieResult'

// eslint-disable-next-line functional/immutable-data
module.exports = Object.assign(createFlowie, { createFlowieContainer })
