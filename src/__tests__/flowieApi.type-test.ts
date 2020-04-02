import { assert } from 'chai'

import tsd from 'tsd'
import { Diagnostic } from 'tsd/dist/lib/interfaces'

describe('flowieApi', function () {
  it('attends the type specification for dist/flowApi.d.ts', async function () {
    const diagnostics = await tsd()

    assert.equal(diagnostics.length, 0, `\n-  ${diagnostics.map(convertDiagnoticsToString).join('\n  -')}\n`)
  }).timeout(15000)
})

function convertDiagnoticsToString (diagnostic: Diagnostic) {
  const fileName = diagnostic.fileName.replace(`${process.cwd()}/`, '')
  const { line, column, message } = diagnostic
  return `${fileName}:${line}:${column} - ${message}`
}
