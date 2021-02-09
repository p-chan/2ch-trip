const trip = require('../')

test('10 digit', () => {
  expect(trip('#fox')).toBe('◆lUykKY/81I')
})

test('10 digit (ja)', () => {
  expect(trip('#ふぉっくす')).toBe('◆MHs9zAfvns')
})

test('12 digit', () => {
  expect(trip('#nishimurahiroyuki')).toBe('◆RlPHyzMEa0O/')
})

test('12 digit (ja)', () => {
  expect(trip('#にしむらひろゆき')).toBe('◆xkuoKRwBsAyK')
})

test('raw key', () => {
  expect(trip('##A49DD9649F6425CB')).toBe('◆Rin/SM.o.6')
})
