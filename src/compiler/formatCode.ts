export default function formatCode (sourceCode: string, shouldDebugFlow: boolean) {
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

  const { code } = preparedCode.split('').reduce(formatCharacters, { previousCharacter: '', identation: 0, code: '' })

  return code.replace(/\}\n\s\s\}/, '}\r\n}')
}

// eslint-disable-next-line complexity
function formatCharacters (
  { previousCharacter, identation, code }: FormattingCharactes,
  character: string,
  index: number,
  wholeCode: readonly string[]
) {
  const isSpace = /\s/.test(character)
  const nextCharacter = wholeCode[index + 1]

  const isOpeningBlock = character === '{' && previousCharacter === ')'
  const isClosingBlock = character === '}' && (previousCharacter === ';' || previousCharacter === '}')

  const reducingIdentationDeltaOnClosingBlock = isClosingBlock ? -1 : 0
  const identationDelta = isOpeningBlock ? 1 : reducingIdentationDeltaOnClosingBlock
  const newIdentation = identation + identationDelta
  const currentIdentation = Math.max(newIdentation + (character === ';' && nextCharacter === '}' ? -1 : 0), 0)

  const splitLineOrNot = character === ';' || isOpeningBlock || isClosingBlock
    ? `${character}\n${' '.repeat(currentIdentation * 2)}`
    : isSpace && previousCharacter === '}'
      ? ''
      : character

  const changedOrSamePreviousCharacter = isSpace ? previousCharacter : character
  return {
    previousCharacter: changedOrSamePreviousCharacter,
    identation: newIdentation,
    code: code.concat(splitLineOrNot)
  }
}

interface FormattingCharactes {
  readonly previousCharacter: string
  readonly identation: number
  readonly code: string
}
