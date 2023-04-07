import { convert } from 'encoding-japanese'
import crypt from 'unix-crypt-td-js'

/**
 * 10 桁トリップを生成する
 */
export const create10DigitsTrip = (key: string) => {
  const saltSuffixString = 'H.'
  const encodedKeyString = convert(key, { from: 'UNICODE', to: 'SJIS', fallback: 'html-entity' })

  const salt = `${encodedKeyString}${saltSuffixString}`
    // 1 文字目から 2 文字を取得する
    .substr(1, 2)
    // . から z までの文字以外を . に置換する
    .replace(/[^\.-z]/g, '.')
    // 配列にする
    .split('')
    // salt として使えない記号をアルファベットに置換する
    .map((string) => {
      if (string === ':') return 'A'
      if (string === ';') return 'B'
      if (string === '<') return 'C'
      if (string === '=') return 'D'
      if (string === '>') return 'E'
      if (string === '?') return 'F'
      if (string === '@') return 'G'
      if (string === '[') return 'a'
      if (string === '\\') return 'b'
      if (string === ']') return 'c'
      if (string === '^') return 'd'
      if (string === '_') return 'e'
      if (string === '`') return 'f'

      return string
    })
    // 文字列にする
    .join('')

  return (crypt(encodedKeyString, salt) as string).substr(-10, 10)
}
