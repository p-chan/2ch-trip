import { convert } from 'encoding-japanese'

import { create10DigitsTrip, create12DigitsTrip, createRawKeyTrip } from './creators'

type Options = Partial<{
  hideWhitespace: boolean
}>

const rawKeyPettern = /^#[0-9A-Fa-f]{16}[.\/0-9A-Za-z]{0,2}$/

const maskSpecialSymbols = (text: string) => text.replace(/★/g, '☆').replace(/◆/g, '◇')

export const createTripByKey = (key: string) => {
  const encodedKeyString = convert(key, 'SJIS', 'UNICODE')

  // 10 桁トリップ
  if (encodedKeyString.length < 12) return create10DigitsTrip(key)

  // 生キートリップ
  if (encodedKeyString.startsWith('#') || encodedKeyString.startsWith('$')) {
    // 拡張用のため ??? を返す
    if (!rawKeyPettern.test(encodedKeyString)) return '???'

    return createRawKeyTrip(key)
  }

  // 12 桁トリップ
  return create12DigitsTrip(key)
}

export const createTripByText = (text: string, options?: Options) => {
  const indexOfSharp = (() => {
    const indexOfHalfWidthSharp = text.indexOf('#')
    const indexOfFullWidthSharp = text.indexOf('＃')

    if (indexOfHalfWidthSharp >= 0) return indexOfHalfWidthSharp
    if (indexOfFullWidthSharp >= 0) return indexOfFullWidthSharp

    return -1
  })()

  if (indexOfSharp < 0) return maskSpecialSymbols(text)

  const name = text.substr(0, indexOfSharp)
  const key = text.substr(indexOfSharp + 1)

  const whitespaceIfNeeded = options?.hideWhitespace ? '' : ' '

  return `${maskSpecialSymbols(name)}${whitespaceIfNeeded}◆${createTripByKey(key)}`
}

export const createTrip = (text: string, options?: Options) => createTripByText(text, options)
