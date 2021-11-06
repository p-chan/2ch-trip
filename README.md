# 2ch-trip

> 2ch like trip generator

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
createTrip('Jim') // -> ziib4d/boU
createTrip('ひろゆき') // -> F7aSjnRHGU

// 12 digits trip
createTrip('N.T.Technology') // -> FG0WWassNUrw
createTrip('パケットモンスター') // -> EZSPRAHOnqfS

// Raw key trip
createTrip('#57414b5554454b41') // -> sWERuZlbhs
createTrip('#4f4d41454d4f4e412d') // -> DUGqJ4796k
```

## Author

[@p-chan](https://github.com/p-chan)

## LICENSE

MIT
