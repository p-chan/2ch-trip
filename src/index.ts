import { convert } from 'encoding-japanese'

import { create10DigitsTrip, create12DigitsTrip, createRawKeyTrip } from './creators'

const rawKeyPettern = /^#[0-9A-Fa-f]{16}[.\/0-9A-Za-z]{0,2}$/

export const createTrip = (key: string) => {
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
