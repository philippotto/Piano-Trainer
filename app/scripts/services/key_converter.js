import _ from "lodash";

export default class KeyConverter {

  constructor() {
    this.initializeKeyMap();
    this.scaleIntervals = [0, 2, 2, 1, 2, 2, 2];
  }


  getNumberForCanonicalKeyString(keyString) {
    return parseInt(_.findKey(this.keyMap, (key) => key === keyString), 10);
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
      lastNote += this.scaleIntervals[index];
      return lastNote;
    }
    )
    .map(this.getKeyStringForNumber, this);
  }


  getCanonicalForm(key) {
    // strips away the given modifier and returns the strippedKey as well as the
    // amount of stripped modifiers
    const stripKey = function (keyToStrip, modifier) {
      const regexp = new RegExp(modifier, "g");
      // ignore the first character so we only strip b-signs and not b-notes
      const strippedKey = keyToStrip[0] + keyToStrip.slice(1).replace(regexp, "");
      const difference = keyToStrip.length - strippedKey.length;

      return [strippedKey, difference];
    };

    let flatDifference, sharpDifference;
    [key, flatDifference] = stripKey(key, "b");
    [key, sharpDifference] = stripKey(key, "#");

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

    const baseScale = [
      "c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"
    ];

    const claviature = baseScale
      .slice(-3)
      .concat(
        _.flatten(_.times(7, () => baseScale))
      ).concat([baseScale[0]]);

    const keyMap = {};

    for (let index = 0, key; index < claviature.length; index++) {
      key = claviature[index];
      const offsettedIndex = index - 3;
      const nr = Math.floor((offsettedIndex + 12) / 12);

      keyMap[index + 21] = key + "/" + nr;
    }

    this.keyMap = keyMap;
  }
}
