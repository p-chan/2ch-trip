import crypt from 'unix-crypt-td-js'

/**
 * 生キートリップを生成する
 */
export const createRawKeyTrip = (key: string) => {
  const saltSuffixString = '..'

  const rawKey = key
    // 2 文字目以降の全ての文字列を取得
    .substr(1)
    // 2 文字ごとに配列に分割する
    .match(/.{2}/g)!
    // ASCII コードを ASCII 文字に変換する
    .map((hexadecimalASCIICode) => {
      const demicalASCIICode = parseInt(hexadecimalASCIICode, 16)

      return String.fromCharCode(demicalASCIICode)
    })
    // 文字列にする
    .join('')

  const salt = `${key}${saltSuffixString}`.substr(17, 2)

  return (crypt(rawKey, salt) as string).substr(-10, 10)
}
