import { describe, expect, test } from 'vitest'
import { createTrip } from './index'

describe('10 Digits', () => {
  test('The trip key include only singlebyte characters', () => {
    expect(createTrip('#Jim')).toBe(' ◆ziib4d/boU')
  })

  test('The trip key include only multibyte characters (hiragana)', () => {
    expect(createTrip('#ひろゆき')).toBe(' ◆F7aSjnRHGU')
  })

  test('The trip key include only multibyte characters  (emoji)', () => {
    expect(createTrip('#🇯🇵')).toBe(' ◆K9zUBOq4IzsD')
  })
})

describe('12 Digits', () => {
  test('The trip key include only singlebyte characters', () => {
    expect(createTrip('#N.T.Technology')).toBe(' ◆FG0WWassNUrw')
  })

  test('The trip key include only multibyte characters (hiragana)', () => {
    expect(createTrip('#パケットモンスター')).toBe(' ◆EZSPRAHOnqfS')
  })

  test('The trip key include only multibyte characters  (emoji)', () => {
    expect(createTrip('#🇯🇵🇯🇵')).toBe(' ◆pD8dlc9B7Wif')
  })

  test('The trip include dot', () => {
    expect(createTrip('#ドットが入るトリ')).toBe(' ◆n2HxTwBby.Ar')
  })
})

describe('Raw', () => {
  test('The trip key include only hexadecimal', () => {
    expect(createTrip('##57414b5554454b41')).toBe(' ◆sWERuZlbhs')
  })

  test('The trip for the future expansion', () => {
    expect(createTrip('#$4d45534849554d41')).toBe(' ◆???')
  })
})

describe('Sharps', () => {
  test('The sharp is singlebyte string', () => {
    expect(createTrip('#半角シャープ')).toBe(' ◆UfNdqf7SBKdu')
  })

  test('The sharp is multibyte string', () => {
    expect(createTrip('＃全角シャープ')).toBe(' ◆WcKp0EJvexJP')
  })
})

describe('Others', () => {
  test('The trip key include whitespace', () => {
    expect(createTrip('#ホワイト スペース')).toBe(' ◆7CqLoauBLfFu')
  })
})

describe('No trip', () => {
  test('The trip key is not defined', () => {
    expect(createTrip('名無しさん＠お腹いっぱい。')).toBe('名無しさん＠お腹いっぱい。')
  })
})

describe('Options', () => {
  test('Hide whitespace', () => {
    expect(createTrip('#未来検索ブラジル', { hideWhitespace: true })).toBe('◆6hXUlBS0slkc')
  })
})
