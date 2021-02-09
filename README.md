# 2ch-trip

Generator for unique signature like as 2ch.

## Install

```
$ npm install 2ch-trip
```

## Usage

```
var genTrip = require('2ch-trip');
var trip = '';

// 10 digit trip
trip = genTrip('#github');
console.log(trip); // ◆lLf/rxkwgg

// 12 digit trip
trip = genTrip('#github-octcat');
console.log(trip); // ◆8JhbOfVQsqBv

// Raw key
trip = genTrip('##A49DD9649F6425CB');
console.log(trip); // ◆Rin/SM.o.6
```

## Library

- [2ch トリップテスター（12 桁・生キー対応）](http://jsdo.it/tdn/trip)
- [base64.js](http://user1.matsumoto.ne.jp/~goma/js/base64.js)
- [ecl.js](http://nurucom-archives.hp.infoseek.co.jp/digital/)
- [des.js](http://user1.matsumoto.ne.jp/~goma/js/des.js)
- [sha1.js](http://user1.matsumoto.ne.jp/~goma/js/sha1.js)
- [tr.js](http://blog.livedoor.jp/dankogai/js/tr.js)

## Author

[@p1ch_jp](https://twitter.com/p1ch_jp)

## License

MIT
