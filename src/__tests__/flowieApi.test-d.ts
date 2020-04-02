import { expectType } from 'tsd'

import flowie, { FlowResult } from '../flowieApi'

function toString (_a: number): string { return _a.toString() }
function toBoolean (_a: number): boolean { return !!_a }

expectType<Promise<FlowResult<string>>>(flowie(toString)(1))
expectType<Promise<FlowResult<readonly [string, string]>>>(flowie(toString, toString)(1))
expectType<Promise<FlowResult<readonly [string, boolean, string]>>>(flowie(toString, toBoolean, toString)(1))
expectType<Promise<FlowResult<readonly [string, boolean, string, boolean]>>>(
  flowie(toString, toBoolean, toString, flowie(toBoolean))(1)
)
