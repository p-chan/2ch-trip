if (!(Kuso instanceof Object)) var Kuso = new function Kuso(){};

Kuso.Class = function Class() {
  var _super, methods, name, constructor, key, C;

  if (arguments.length == 2) {
    _super = arguments[0];
    methods = arguments[1];
  }
  else {
    _super = Object;
    methods = arguments[0];
  }

  if (methods.hasOwnProperty('initialize')) {
    constructor = methods.initialize;
    delete methods.initialize;
  }
  else {
    constructor = new Function();
  }

  if (typeof _super == 'function') {
    C = function Class() {
      _super.apply(this, arguments);
      constructor.apply(this, arguments);
    };

    C.prototype = new _super();
  }
  else {
    C = function Class() {
      constructor.apply(this, arguments);
    };

    C.prototype = _super;
  }

  for (key in methods) {
    if (!methods.hasOwnProperty(key)) continue;
    C.prototype[key] = methods[key];
  }

  return C;
};

Kuso.fillZero = function fillZero(num, digit) {
  var str = num.toString();
  var times = digit - str.length;

  if (times >= 1) {
    for (var i = 0; i < times; i++) {
      str = '0' + str;
    }
  }

  return str;
};
Kuso.escapeHTML = function escapeHTML(str) {
  var table = {
    '"' : '&quot;',
    '\'' : '&#39;',
    '<' : '&lt;',
    '>' : '&gt;',
    '&' : '&amp;'
  };

  var split = str.split('');

  for (var i = 0; i < split.length; i++) {
    if (table.hasOwnProperty(split[i])) {
      split[i] = table[split[i]];
    }
  }

  return split.join('');
};
Kuso.hexToBin = function hexToBin(hex) {
  var buf = '';
  var bin = '';

  for (var i = 0; i < hex.length; i++) {
    buf += hex[i];
    if (buf.length == 2) {
      bin += String.fromCharCode(parseInt(buf, 16));
      buf = '';
    }
  }

  return bin;
};

module.exports = Kuso;