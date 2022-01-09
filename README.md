# 2ch-trip

> 2ch compatible trip generator

## Install

```sh
npm install 2ch-trip
```

or

```sh
yarn add 2ch-trip
```

## Usage

```ts
import { createTrip } from '2ch-trip'

// 10 digits trip
createTrip('#Jim') // -> ' ◆ziib4d/boU'
createTrip('#ひろゆき') // -> ' ◆F7aSjnRHGU'

// 12 digits trip
createTrip('#N.T.Technology') // -> ' ◆FG0WWassNUrw'
createTrip('#パケットモンスター') // -> ' ◆EZSPRAHOnqfS'

// Raw key trip
createTrip('##57414b5554454b41') // -> ' ◆sWERuZlbhs'
createTrip('#$4d45534849554d41') // -> ' ◆???'
```

:warning: Don't support string that cannot be converted to Shift_JIS (ex: Emoji)

## Author

[@p-chan](https://github.com/p-chan)

## LICENSE

MIT
