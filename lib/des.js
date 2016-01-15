

    /* /_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
    charset= shift_jis

    +++ DATA ENCRYPTION STANDARD (DES) アルゴリズム +++

    http://www.itl.nist.gov/fipspubs/fip46-2.htm


    LastModified : 2006-11/07

    Powered by kerry
    http://user1.matsumoto.ne.jp/~goma/

    動作ブラウザ :: IE4+ , NN4.06+ , Gecko , Opera6+

    ----------------------------------------------------------------

    Usage;

    * 暗号化
    cipherText = des.encrypt( plainText,  key [, mode [, iv [, paddingChar]]] );

    * 復号化
    plainText = des.decrypt( cipherText, key [, mode [, paddingChar]] );

  * TripleDES 暗号化
  cipherText = des.tripleEnc( plainText,  key1 , key2 [, key3 [, padding_char]] );

  * TripleDES 復号化
  plainText = des.tripleDec( cipherText,  key1 , key2 [, key3 [, padding_char]] );

  * CRYPT(3)
  cipherText = des.crypt(key, salt);

    * IV を適当に作らせる
    IV = des.mkIV();


    * 暗号･復号共に連想配列で渡すことも出来る
    // e.g.
    myHash = {
        // Key  : value ( Key は固定 )
        data    : "Hello !!",
        key     : "myKey",
        mode    : "cbc",
        iv      : des.mkIV(),
        pchar   : "\x05"
    };
    cipherText = des.encrypt( myHash );



    * 拙作の Base64 ライブラリを使う ( 別途必要 )

    - 暗号文を符号化
    cipherText   = des.encrypt( 略.... );
    cipherText64 = base64.encode( cipherText );

    - 符号化された暗号文を復号化
    cipherText = base64.decode( cipherText64 );
    plainText  = des.encrypt( 略.... );


    * 拙作の URL エンコード/デコード関数を使う ( 同スクリプトに有り )

    - 暗号文を符号化
    cipherText   = des.encrypt( 略.... );
    cipherURLstr = utf.URLencode( cipherText );

    - 符号化された暗号文を復号化
    cipherText = utf.URLdecode( cipherURLstr );
    plainText  = des.( 略.... );



    plainText   ->  平文
    cipherText  ->  暗号文
    key         ->  キー [ 8 byte ]
    mode        ->  ecb | cbc | cfb | ofb 。省略時は ecb モード
    iv          ->  8 byte (ecb モードでは不要)
  salt    ->  2 文字 [ a-z A-Z 0-9 . / ]
    paddingChar ->  平文を8の倍数にするために使用するキャラクタ。
    ( pchar )       省略時は 0x05。通常は特に指定しないがバイナリ
                    の際は必要かもしれない。( データ最後のバイトが
                    0x05 であった時、復号化時パディングされた文字を
                    削って返す際プログラムは何バイト削ればいいかを
                    知らないので元のデータまで削ってしまう、ということ )


    * バイナリモード
    当ライブラリはデフォルトで文字列を扱うようになっています。
    データがバイナリの場合は事前にモード変更しておく必要があります。
    ex)
    des.binMode     = 1;
    cipherData      = des.encrypt( 略.... );

    上記の様に暗号・復号前に des.binMode に真となる値を代入することで
    バイナリモードになります。文字列モードに戻すには
    ex)
    des.binMode     = 0;

    偽になる値を代入します。

    /_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/ */



des = new function()
{
    var utfLibName  = "utf";
    var def_mode    = "ecb";
    var def_padChar = "\x05";
    var blockLen    = 8;
    var keyLen      = 8;
    var keyz        = [];
    var tmpBlk      = [];
    var enc         = {};
    var dec         = {};
    var argKeyz     = ["data", "key", "mode", "iv", "pchar"];
    var argDKeyz    = [argKeyz[0], argKeyz[1], argKeyz[2], argKeyz[4]];
    this.binMode    = 0;


    this.mkIV = function(_len)
    {
        if (!_len || isNaN(_len)) _len = blockLen;
        var iv  = "";
        while (_len--) iv += String.fromCharCode( Math.floor(Math.random()* 0xff) );
        return iv;
    }

    this.mkKey = function(_len)
    {
        if (!_len || isNaN(_len)) _len = keyLen;
        var k = "";
        while (_len--) k += String.fromCharCode( parseInt(Math.random()* 0x50)+ 0x20 );
        return k;
    }

    this.encrypt = function()
    {
        var arg = initArg(arguments, "encrypt", this.binMode);
        keyz    = keyUpdate(arg.keyz);
        tmpBlk  = arg.ivz;
        var i, edat = "";
        for (i=0; i<arg.datz.length; i+=blockLen) {
            edat += packChar( enc[arg.mode](arg.datz.slice(i, i+ blockLen)) );
        }
        return arg.iv+ edat;
    }

    this.decrypt = function()
    {
        var arg = initArg(arguments, "decrypt");
        keyz    = keyUpdate(arg.keyz);
        tmpBlk  = arg.ivz;
        var i, edat = [];

        for (i=0; i<arg.datz.length; i+=blockLen) {
            edat = edat.concat( dec[arg.mode](arg.datz.slice(i, i+ blockLen)) );
        }
        return (this.binMode? packChar(edat): packUTF8(edat)
                ).replace( new RegExp(arg.pchar+"+$"), "");
    }

    enc.ecb = function(_blk)
    {
        return round(_blk);
    }

    dec.ecb = function(_blk)
    {
        return re_round(_blk);
    }

    enc.cbc = function(_blk)
    {
        return tmpBlk = round(xor(_blk, tmpBlk));
    }

    dec.cbc = function(_blk)
    {
        var tmp = _blk;
        _blk = xor(re_round(_blk), tmpBlk);
        tmpBlk = tmp;
        return _blk;
    }

    enc.cfb = function(_blk)
    {
        return tmpBlk = xor(round(tmpBlk), _blk);
    }

    dec.cfb = function(_blk)
    {
        var tmp = xor(round(tmpBlk), _blk);
        tmpBlk = _blk;
        return tmp;
    }

    enc.ofb = function(_blk)
    {
        tmpBlk = round(tmpBlk);
        return xor(tmpBlk, _blk);
    }

    dec.ofb = function(_blk)
    {
        tmpBlk = round(tmpBlk);
        return xor(tmpBlk, _blk);
    }

    var initArg = function(_arg, _encrypt, _bin)
    {
        var val     = {};
        var padDatz = 1;
        var padKeyz = 1;
        var i;
        var isStr = new Function("_x", "return typeof(_x) == typeof('string')");

        _encrypt = !!(_encrypt && _encrypt.match(/^enc/i) !== null);

        var aks = _encrypt? argKeyz: argDKeyz;
        if (typeof(_arg[0]) == typeof(val))
            val = _arg[0];
        else for (i=0; i<_arg.length; i++)
                val[aks[i]] = _arg[i];


        if (!isStr(val.pchar)) val.pchar = def_padChar;
        var tmpPChar = unpackChar(val.pchar);


        if (!isStr(val.mode) || val.mode.match(/^(ecb|cbc|ofb|cfb)$/i) === null)
            val.mode = def_mode;
        val.mode = val.mode.toLowerCase();


        if (!isStr(val.key)) val.key = "\0";
        val.keyz = unpackChar(val.key);
        if (padKeyz)
            for (i=val.keyz.length; i<keyLen; i++) val.keyz[i] = 0;


        if (!_encrypt || _bin)
            val.datz = unpackChar(val.data);
        else
            val.datz = unpackUTF8(val.data);
        if (_encrypt && padDatz)
            for (i=val.datz.length%blockLen; i<blockLen; i++)
                val.datz[val.datz.length] = tmpPChar;

        if (val.mode == "ecb")
        {
            val.iv  = "";
            val.ivz = [];
        }
        else if (_encrypt)
        {
            if (!isStr(val.iv)) val.iv = "";
            val.ivz = unpackChar(val.iv);
            for (i=val.ivz.length; i<blockLen; i++) val.ivz[i] = 0;
            val.ivz.length = blockLen;
            val.iv = packChar(val.ivz);
        }
        else
        {
            val.ivz  = val.datz.slice(0, blockLen);
            val.datz = val.datz.slice(blockLen);
        }

        return val;
    }

    var xor = function(_a, _b)
    {
        var i, tmp = [];
        for (i=0; i<_a.length; i++)
            tmp[i] = _a[i] ^ _b[i];
        return tmp;
    }

    var packUTF8    = function(_x){ return global[utfLibName].packUTF8(_x) };
    var unpackUTF8  = function(_x){ return global[utfLibName].unpackUTF8(_x) };
    var packChar    = function(_x){ return global[utfLibName].packChar(_x) };
    var unpackChar  = function(_x){ return global[utfLibName].unpackChar(_x) };


    var round = function(_blk)
    {
        var tmp = byte2bit(_blk);
        tmp     = Xpermutation(tmp, IP);
        var L   = tmp.slice(0, 32);
        var R   = tmp.slice(32);
        var i;
        for (i=0; i<16; i++)
        {
            tmp = xor(L, f(R, keyz[i]));
            L   = R;
            R   = tmp;
        }
    //  最後だけL,R が入れ替わらないので R.concat(L) は正しい
        tmp = Xpermutation(R.concat(L), IIP);
        return bit2byte(tmp);
    }

    var re_round = function(_blk)
    {
        var tmp = byte2bit(_blk);
        tmp     = Xpermutation(tmp, IP);
        var R   = tmp.slice(0, 32);
        var L   = tmp.slice(32);
        var i   = 16;
        while (i--)
        {
            tmp = xor(R, f(L, keyz[i]));
            R   = L;
            L   = tmp;
        }
        tmp = Xpermutation(L.concat(R), IIP);
        return bit2byte(tmp);
    }

    var keyUpdate = function(_key, _isBit)
    {
        if (!_isBit) _key = byte2bit(_key);
        _key    = Xpermutation(_key, PC1);

        var cn  = _key.slice(0, 28);
        var dn  = _key.slice(28);
        var k   = [];
        for (var i=0; i<LS.length; i++)
        {
            cn  = rotL(cn, LS[i]);
            dn  = rotL(dn, LS[i]);
            k[i]= Xpermutation( cn.concat(dn), PC2 );
        }
        return k;
    }

    var f = function(_r, _k)
    {
      return Xpermutation( getSboxVal( xor( Xpermutation(_r, E), _k)), P);
    }

    var xor = function(_a, _b)
    {
        var i, tmp = [];
        for (i=0; i<_a.length; i++)
            tmp[i] = _a[i] ^ _b[i];
        return tmp;
    }

    var rotL = function(_v, _s)
    {
        return _v.slice(_s).concat(_v.slice(0, _s));
    }

    var getSboxVal = function(_v)
    {
        var i, n, rn, cn, tmp = [];

        for (i=0; i<48 /* _v.length */; i+=6)
        {
        rn  = (_v[i]<<1) | _v[i+5];
            cn  = (_v[i+1]<<3) | (_v[i+2]<<2) | (_v[i+3]<<1) | _v[i+4];
            n   = S[i/6][(rn*16)+ cn];
            tmp = tmp.concat((n >>> 3) & 1, (n >>> 2) & 1, (n >>> 1) & 1, n & 1);
        }
        return tmp;
    }

    var Xpermutation = function(_val, _def)
    {
        var i, tmp = [];
        var n = _def.length;
        for (i=0; i<n; i++)
            tmp[i] = _val[_def[i]];
        return tmp;
    }

    var bit2byte = function(_bz)
    {
        var i,n, tmp = [];

        for (n=i=0; i<_bz.length; i+=8, n++) {
            tmp[n] = (_bz[i  ]<<7) | (_bz[i+1]<<6) | (_bz[i+2]<<5) | (_bz[i+3]<<4)
                    |(_bz[i+4]<<3) | (_bz[i+5]<<2) | (_bz[i+6]<<1) | (_bz[i+7]   );
        }
        return tmp;
    }

    var byte2bit = function(_bz)
    {
        var i,k,n, tmp = [];

        for (n=i=0; i<_bz.length; i++) {
            for (k=7; k>=0; k--, n++)
                tmp[n] = (_bz[i]>>>k) & 1;
        }

        return tmp;
    }


  // start tripleDes _________

  var def_des3mode = "ecb"; // fixed

    var checkKey = function(_k)
    {
      if (typeof(_k) != typeof("str")) _k = "";
      var k = unpackChar(_k);
      for (var i=k.length; i<keyLen; i++) k[i] = 0;
      return k;
    }

  this.tripleEnc = function(_txt, _key1, _key2, _key3, _pchar)
    {
      var i, tmp = [];

      if (!_key3) _key3 = _key1;
      if (typeof(_pchar) != typeof("str")) _pchar = def_padChar;
      _pchar = unpackChar(_pchar)[0];

      var datz = this.binMode? unpackChar(_txt): unpackUTF8(_txt);
    var datLen = datz.length;
      if (datLen% blockLen)
        for (i=datLen% blockLen; i<blockLen; i++)
          datz[datz.length] = _pchar;
    datLen = datz.length;

      keyz = keyUpdate(checkKey(_key1));
      for (i=0; i<datLen; i+=blockLen) {
            tmp = tmp.concat( enc[def_des3mode](datz.slice(i, i+ blockLen)) );
        }
      keyz = keyUpdate(checkKey(_key2));
      datz = [];
      for (i=0; i<datLen; i+=blockLen) {
            datz = datz.concat( dec[def_des3mode](tmp.slice(i, i+ blockLen)) );
        }
        keyz = keyUpdate(checkKey(_key3));
        tmp  = [];
      for (i=0; i<datLen; i+=blockLen) {
            tmp = tmp.concat( enc[def_des3mode](datz.slice(i, i+ blockLen)) );
        }
      return packChar(tmp);
    }

    this.tripleDec = function(_txt, _key1, _key2, _key3, _pchar)
    {
      var i, tmp = [];
      if (!_key3) _key3 = _key1;
      if (typeof(_pchar) != typeof("str")) _pchar = def_padChar;
      _pchar    = packChar([unpackChar(_pchar)[0]]);
      var datz  = unpackChar(_txt);
    var datLen  = datz.length;

      keyz = keyUpdate(checkKey(_key3));
      for (i=0; i<datLen; i+=blockLen) {
            tmp = tmp.concat( dec[def_des3mode](datz.slice(i, i+ blockLen)) );
        }
      keyz = keyUpdate(checkKey(_key2));
      datz = [];
      for (i=0; i<datLen; i+=blockLen) {
            datz = datz.concat( enc[def_des3mode](tmp.slice(i, i+ blockLen)) );
        }
        keyz = keyUpdate(checkKey(_key1));
        tmp = [];
      for (i=0; i<datLen; i+=blockLen) {
            tmp = tmp.concat( dec[def_des3mode](datz.slice(i, i+ blockLen)) );
        }
        _txt = this.binMode? packChar(tmp): packUTF8(tmp);
        return _txt.replace( new RegExp(_pchar+"+$"), "");
    }
  // end triple des _________

  // start crypt(3) functions _________

  var cchar   = ( "./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
          + "abcdefghijklmnopqrstuvwxyz" ).split("");
  var saltz   = [];

  this.crypt = function(_key, _slt)
  {
    var blk   = [0,0,0,0, 0,0,0,0];
    var orgF  = f;
    f       = cryptF;
    _slt    = initSalt(_slt);
    keyz    = initC3key(_key);
    keyz    = keyUpdate(keyz, 1);
    var i, hash = "";

    for (i=0; i<25; i++) blk = round(blk);
    blk = byte2bit(blk);
    blk = blk.concat(0,0); // blk=64bit -> (64+2) % 6 = 0
    for (i=0; i<blk.length; i+=6)
      hash += cchar[ byte2Xbit(blk.slice(i, i+6)) ];
    f = orgF;
    return _slt+ hash;
  }

  var byte2Xbit = function(_b)
  {
    var i, tmp = 0;
    for (i=0; i<_b.length; i++)
      tmp = (tmp<<1) | _b[i];
    return tmp;
  }

  var initSalt = function(_s)
  {
    if (typeof(_s) != typeof("string")) _s = "";
    _s+= cchar[Math.floor(Math.random()* 64)]+ cchar[Math.floor(Math.random()* 64)];
    _s = _s.substr(0, 2);
    _s = _s.replace(/[^\/\.a-zA-Z0-9]/g, ".");
    var sz = _s.split("");
    var i, n;
    for (i=0; i<2 /* sz.length */; i++)
    {
      for (n=0; n<=0x3f /* cchar.length */; n++)
      {
        if (sz[i] == cchar[n]) {
          sz[i] = n;
          break;
        }
      }
    }
    var s6r = function(_x) { return byte2bit([_x]).slice(2).reverse() };
    saltz = s6r(sz[0]).concat( s6r(sz[1]) );
    return _s;
  }

  var initC3key = function(_k)
  {
    var k = checkKey(_k);
    var tmp = [];
    for (var i=0; i<blockLen; i++)
      tmp = tmp.concat( byte2bit([k[i]]).slice(1), 0 );
    return tmp;
  }

  var cryptF = function(_r, _k)
  {
    _r = Xpermutation(_r, E);
    var i, tmp;
    for (i=0; i<12 /* saltz.length */; i++) if (saltz[i])
    {
      tmp   = _r[i];
      _r[i]   = _r[24+i];
      _r[24+i]= tmp;
    }
    return Xpermutation( getSboxVal( xor( _r, _k)), P);
  }
  // end crypt(3) functions _________

    var LS = [1, 1, 2, 2, 2, 2, 2, 2,   1, 2, 2, 2, 2, 2, 2, 1];

    var E = [
        31,  0,  1,  2,  3,  4,      3,  4,  5,  6,  7,  8,
         7,  8,  9, 10, 11, 12,     11, 12, 13, 14, 15, 16,
        15, 16, 17, 18, 19, 20,     19, 20, 21, 22, 23, 24,
        23, 24, 25, 26, 27, 28,     27, 28, 29, 30, 31,  0
    ];

    var PC1 = [
        56, 48, 40, 32, 24, 16,  8,      0, 57, 49, 41, 33, 25, 17,
         9,  1, 58, 50, 42, 34, 26,     18, 10,  2, 59, 51, 43, 35,
        62, 54, 46, 38, 30, 22, 14,      6, 61, 53, 45, 37, 29, 21,
        13,  5, 60, 52, 44, 36, 28,     20, 12,  4, 27, 19, 11,  3
    ];

    var PC2 = [
        13, 16, 10, 23,  0,  4,      2, 27, 14,  5, 20,  9,
        22, 18, 11,  3, 25,  7,     15,  6, 26, 19, 12,  1,
        40, 51, 30, 36, 46, 54,     29, 39, 50, 44, 32, 47,
        43, 48, 38, 55, 33, 52,     45, 41, 49, 35, 28, 31
    ];

    var P = [
        15,  6, 19, 20, 28, 11, 27, 16,      0, 14, 22, 25,  4, 17, 30,  9,
         1,  7, 23, 13, 31, 26,  2,  8,     18, 12, 29,  5, 21, 10,  3, 24
    ];

    var IP = [
        57, 49, 41, 33, 25, 17,  9,  1,     59, 51, 43, 35, 27, 19, 11,  3,
        61, 53, 45, 37, 29, 21, 13,  5,     63, 55, 47, 39, 31, 23, 15,  7,
        56, 48, 40, 32, 24, 16,  8,  0,     58, 50, 42, 34, 26, 18, 10,  2,
        60, 52, 44, 36, 28, 20, 12,  4,     62, 54, 46, 38, 30, 22, 14,  6
    ];

    var IIP = [
        39,  7, 47, 15, 55, 23, 63, 31,     38,  6, 46, 14, 54, 22, 62, 30,
        37,  5, 45, 13, 53, 21, 61, 29,     36,  4, 44, 12, 52, 20, 60, 28,
        35,  3, 43, 11, 51, 19, 59, 27,     34,  2, 42, 10, 50, 18, 58, 26,
        33,  1, 41,  9, 49, 17, 57, 25,     32,  0, 40,  8, 48, 16, 56, 24
    ];

    var S = [
        [
            14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7,
            0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8,
            4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0,
            15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13
        ],[
            15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10,
            3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5,
            0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15,
            13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9
        ],[
            10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8,
            13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1,
            13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7,
            1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12
        ],[
            7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15,
            13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9,
            10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4,
            3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14
        ],[
            2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9,
            14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6,
            4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14,
            11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3
        ],[
            12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11,
            10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8,
            9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6,
            4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13
        ],[
            4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1,
            13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6,
            1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2,
            6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12
        ],[
            13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7,
            1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2,
            7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8,
            2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11
        ]
    ];
}

module.exports = des;



    /* /_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
    charset = shift_jis

    +++ UTF8/16 ライブラリ +++


    LastModified : 2006-10/15

    Powered by kerry
    http://202.248.69.143/~goma/

    動作ブラウザ :: IE4+ , NN4.06+ , Gecko , Opera6+



    * [RFC 2279] UTF-8, a transformation format of ISO 10646
    ftp://ftp.isi.edu/in-notes/rfc2279.txt

    * [RFC 1738] Uniform Resource Locators (URL)
    ftp://ftp.isi.edu/in-notes/rfc1738.txt

    /_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

    Usage:

    // 文字列を UTF16 (文字コード) へ
    utf16code_array = utf.unpackUTF16( my_string );

    // 文字列を UTF8 (文字コード) へ
    utf8code_array = utf.unpackUTF8( my_string );

    // UTF8 (文字コード) から文字列へ。 utf.unpackUTF8() したものを元に戻す
    my_string = utf.packUTF8( utf8code_array );

    // UTF8/16 (文字コード) を文字列へ
    my_string = utf.packChar( utfCode_array );

    // UTF16 (文字コード) から UTF8 (文字コード) へ
    utf8code_array = utf.toUTF8( utf16code_array );

    // UTF8 (文字コード) から UTF16 (文字コード) へ
    utf16code_array = utf.toUTF16( utf8code_array );



    // URL 文字列へエンコード
    url_string = utf.URLencode( my_string );

    // URL 文字列からデコード
    my_string = utf.URLdecode( url_string );

    /_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/ */



utf = new function()
{
    this.unpackUTF16 = function(_str)
    {
        var i, utf16=[];
        for (i=0; i<_str.length; i++) utf16[i] = _str.charCodeAt(i);
        return utf16;
    }

    this.unpackChar = function(_str)
    {
        var utf16 = this.unpackUTF16(_str);
        var i,n, tmp = [];
        for (n=i=0; i<utf16.length; i++) {
            if (utf16[i]<=0xff) tmp[n++] = utf16[i];
            else {
                tmp[n++] = utf16[i] >>> 8;
                tmp[n++] = utf16[i] &  0xff;
            }
        }
        return tmp;
    }

    this.packChar  =
    this.packUTF16 = function(_utf16)
    {
        var i, str = "";
        for (i in _utf16) str += String.fromCharCode(_utf16[i]);
        return str;
    }

    this.unpackUTF8 = function(_str)
    {
       return this.toUTF8( this.unpackUTF16(_str) );
    }

    this.packUTF8 = function(_utf8)
    {
        return this.packUTF16( this.toUTF16(_utf8) );
    }

    this.toUTF8 = function(_utf16)
    {
        var utf8 = [];
        var idx = 0;
        var i, j, c;
        for (i=0; i<_utf16.length; i++)
        {
            c = _utf16[i];
            if (c <= 0x7f) utf8[idx++] = c;
            else if (c <= 0x7ff)
            {
                utf8[idx++] = 0xc0 | (c >>> 6 );
                utf8[idx++] = 0x80 | (c & 0x3f);
            }
            else if (c <= 0xffff)
            {
                utf8[idx++] = 0xe0 | (c >>> 12 );
                utf8[idx++] = 0x80 | ((c >>> 6 ) & 0x3f);
                utf8[idx++] = 0x80 | (c & 0x3f);
            }
            else
            {
                j = 4;
                while (c >> (6*j)) j++;
                utf8[idx++] = ((0xff00 >>> j) & 0xff) | (c >>> (6*--j) );
                while (j--)
                utf8[idx++] = 0x80 | ((c >>> (6*j)) & 0x3f);
            }
        }
        return utf8;
    }

    this.toUTF16 = function(_utf8)
    {
        var utf16 = [];
        var idx = 0;
        var i,s;
        for (i=0; i<_utf8.length; i++, idx++)
        {
            if (_utf8[i] <= 0x7f) utf16[idx] = _utf8[i];
            else
            {
                if ( (_utf8[i]>>5) == 0x6)
                {
                    utf16[idx] = ( (_utf8[i] & 0x1f) << 6 )
                                 | ( _utf8[++i] & 0x3f );
                }
                else if ( (_utf8[i]>>4) == 0xe)
                {
                    utf16[idx] = ( (_utf8[i] & 0xf) << 12 )
                                 | ( (_utf8[++i] & 0x3f) << 6 )
                                 | ( _utf8[++i] & 0x3f );
                }
                else
                {
                    s = 1;
                    while (_utf8[i] & (0x20 >>> s) ) s++;
                    utf16[idx] = _utf8[i] & (0x1f >>> s);
                    while (s-->=0) utf16[idx] = (utf16[idx] << 6) ^ (_utf8[++i] & 0x3f);
                }
            }
        }
        return utf16;
    }

    this.URLencode = function(_str)
    {
        return _str.replace(/([^a-zA-Z_\-\.])/g, function(_tmp, _c)
            {
                if (_c == "\x20") return "+";
                var tmp = utf.toUTF8( [_c.charCodeAt(0)] );
                var c = "";
                for (var i in tmp)
                {
                    i = tmp[i].toString(16);
                    if (i.length == 1) i = "0"+ i;
                    c += "%"+ i;
                }
                return c;
            } );
    }

    this.URLdecode = function(_dat)
    {
        _dat = _dat.replace(/\+/g, "\x20");
        _dat = _dat.replace( /%([a-fA-F0-9][a-fA-F0-9])/g,
                function(_tmp, _hex){ return String.fromCharCode( parseInt(_hex, 16) ) } );
        return this.packChar( this.toUTF16( this.unpackUTF16(_dat) ) );
    }
}