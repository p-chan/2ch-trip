import { createTrip } from './index'

const trips = {
  '10Digits': [
    { key: 'Jim', trip: 'ziib4d/boU' },
    { key: 'ひろゆき', trip: 'F7aSjnRHGU' },
  ],
  '12Digits': [
    { key: 'N.T.Technology', trip: 'FG0WWassNUrw' },
    { key: 'パケットモンスター', trip: 'EZSPRAHOnqfS' },
  ],
  raw: [
    { key: '#57414b5554454b41', trip: 'sWERuZlbhs' },
    { key: '#4f4d41454d4f4e412d', trip: 'DUGqJ4796k' },
    { key: '$4d45534849554d41', trip: '???' },
  ],
}

describe('10 Digits', () => {
  trips['10Digits'].forEach(({ key, trip }) => {
    test(`${key} -> ${trip}`, () => {
      expect(createTrip(key)).toBe(trip)
    })
  })
})

describe('12 Digits', () => {
  trips['12Digits'].forEach(({ key, trip }) => {
    test(`${key} -> ${trip}`, () => {
      expect(createTrip(key)).toBe(trip)
    })
  })
})

describe('Raw', () => {
  trips.raw.forEach(({ key, trip }) => {
    test(`${key} -> ${trip}`, () => {
      expect(createTrip(key)).toBe(trip)
    })
  })
})
