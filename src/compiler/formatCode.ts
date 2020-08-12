// the idea of formatting here is not to follow any pattern, but getting a "debuggable" code
export default function formatCode (sourceCode: string, shouldDebugFlow: boolean): string {
  if (!shouldDebugFlow) return sourceCode

  const preparedCode = sourceCode
    .replace(/\r?\n/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/;\s/g, ';')
    .replace(/,\s\]/g, ']')
    .replace(/\s\}/gi, '}')
    .replace(/\{\s/gi, '{')
    .replace(/\[\s/gi, '[')
    .replace(/\)\s\{/gi, '){')

  const { code } = preparedCode.split('').reduce(formatCharacters, { previousCharacter: '', indentation: 0, code: '' })

  return code.replace(/\}\n\s\s\}/, '}\r\n}')
}

// eslint-disable-next-line complexity
function formatCharacters (
  { previousCharacter, indentation, code }: FormattingCharacter,
  character: string,
  index: number,
  wholeCode: ReadonlyArray<string>
) {
  const isSpace = /\s/.test(character)
  const nextCharacter = wholeCode[index + 1]

  const isOpeningBlock = character === '{' && previousCharacter === ')'
  const isClosingBlock = character === '}' && (previousCharacter === ';' || previousCharacter === '}')

  const reducingIndentationDeltaOnClosingBlock = isClosingBlock ? -1 : 0
  const indentationDelta = isOpeningBlock ? 1 : reducingIndentationDeltaOnClosingBlock
  const newIndentation = indentation + indentationDelta
  const currentIndentation = Math.max(newIndentation + (character === ';' && nextCharacter === '}' ? -1 : 0), 0)

  const splitLineOrNot = character === ';' || isOpeningBlock || isClosingBlock
    ? `${character}\n${' '.repeat(currentIndentation * 2)}`
    : isSpace && previousCharacter === '}'
      ? ''
      : character

  const changedOrSamePreviousCharacter = isSpace ? previousCharacter : character
  return {
    previousCharacter: changedOrSamePreviousCharacter,
    indentation: newIndentation,
    code: code.concat(splitLineOrNot)
  }
}

interface FormattingCharacter {
  readonly previousCharacter: string
  readonly indentation: number
  readonly code: string
}
