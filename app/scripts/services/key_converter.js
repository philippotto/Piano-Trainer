import _ from 'lodash';

export default class KeyConverter {

  constructor() {

    this.initializeKeyMap();
    this.scaleIntervals = [ 0, 2, 2, 1, 2, 2, 2 ];
  }


  getNumberForCanonicalKeyString(keyString) {

    return parseInt(_.findKey(this.keyMap, function(key) { return key === keyString; }), 10);
  }


  getNumberForKeyString(keyString) {

    keyString = this.getCanonicalForm(keyString);
    return this.getNumberForCanonicalKeyString(keyString);
  }


  getScaleForBase(baseKey) {

    // TODO: this returns canonical key strings
    // For example, the last key of the f sharp major scale is e#
    // The function will return a f (which is harmonically seen the same)

    if (_.isString(baseKey)) {
      baseKey = this.getNumberForKeyString(baseKey);
    }

    baseKey = parseInt(baseKey, 10);

    let lastNote = baseKey;

    return _.times(7, (index) => {
      lastNote = lastNote + this.scaleIntervals[index];
      return lastNote;
    }
    )
    .map(this.getKeyStringForNumber, this);
  }


  getCanonicalForm(key) {

    const stripKey = function(keyToStrip, modifier) {

      const regexp = new RegExp(modifier, "g");
      // ignore the first character because of b notes
      const strippedKey = keyToStrip[0] + keyToStrip.slice(1).replace(regexp, "");
      const difference = keyToStrip.length - strippedKey.length;

      return [strippedKey, difference];
    };

    var [key, sharpDifference] = stripKey(key, "#");
    var [key, flatDifference] = stripKey(key, "b");

    key = this.getNumberForCanonicalKeyString(key);
    key = key + sharpDifference - flatDifference;

    return this.getKeyStringForNumber(key);
  }



  getKeyStringForNumber(number) {

    return this.keyMap[number + ""];
  }


  initializeKeyMap() {

    // builds a keyMap which looks like this
    // {
    //   21 : "a/0"
    //   22 : "a#/0"
    //   ...
    //   108 : "c/8"
    // }

    var baseScale = [
      "c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"
    ];

    var claviature = baseScale.slice(-3).concat(_.flatten(_.times(7, function() { return baseScale; }))).concat([baseScale[0]]);


    var keyMap = {};

    for (var index = 0, key; index < claviature.length; index++) {
      key = claviature[index];
      var offsettedIndex = index - 3;
      var nr = Math.floor((offsettedIndex + 12) / 12);

      keyMap[index + 21] = key + "/" + nr;
    }

    return this.keyMap = keyMap;
  }
}
