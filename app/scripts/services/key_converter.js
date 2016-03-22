import _ from "lodash";

const scaleIntervals = [0, 2, 2, 1, 2, 2, 2];
const keyMap = initializeKeyMap();
const keySignatures = ["C#", "F#", "B", "E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"];

function initializeKeyMap() {
  // builds a keyMap which looks like this
  // {
  //   21 : "a/0"
  //   22 : "a#/0"
  //   ...
  //   108 : "c/8"
  // }

  const octaveNotes = [
    "c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"
  ];
  const octaveNoteLength = octaveNotes.length;

  const claviatureOffset = -3;
  const octaveCount = 7;
  const claviature = octaveNotes
    .slice(claviatureOffset)
    .concat(
      _.flatten(_.times(octaveCount, () => octaveNotes))
    ).concat([octaveNotes[0]]);

  const keyMap = {};

  for (let index = 0, key; index < claviature.length; index++) {
    key = claviature[index];
    const offsettedIndex = index + claviatureOffset;
    const nr = Math.floor((offsettedIndex + octaveNoteLength) / octaveNoteLength);

    keyMap[index + 21] = key + "/" + nr;
  }

  return keyMap;
}


export default {

  getKeyNumberForCanonicalKeyString: function (keyString) {
    return parseInt(_.findKey(keyMap, (key) => key === keyString), 10);
  },


  getKeyNumberForKeyString: function (keyString, keySignature) {
    keyString = this.getCanonicalKeyString(keyString);
    const keyNumber = this.getKeyNumberForCanonicalKeyString(keyString);

    if (keySignature !== "C") {
      // find out whether keyNumber is affected by keySignature
      // if yes, increment/decrement it accordingly
      const scaleNotes = this.getScaleKeysForBase(keySignature.toLowerCase() + "/1").map((el) =>
        this.getKeyStringForKeyNumber(el).split("/")[0]
      );
      if (scaleNotes.indexOf(keyString.split("/")[0]) === -1) {
        const modifierType = this.getModifierTypeOfKeySignature(keySignature);
        let offset = 0;
        if (modifierType === "#") {
          offset = +1;
        } else if (modifierType === "b") {
          offset = -1;
        }
        return keyNumber + offset;
      }
    }

    return keyNumber;
  },

  getScaleKeysForBase: function (baseKeyString) {
    // Returns canonical key strings.
    // For example, the last key of the f sharp major scale is e#
    // The function will return a f (which is harmonically seen the same)

    if (_.isString(baseKeyString)) {
      baseKeyString = this.getKeyNumberForKeyString(baseKeyString, "C");
    }

    baseKeyString = parseInt(baseKeyString, 10);

    let lastKey = baseKeyString;

    return _.times(7, (index) => {
      lastKey += scaleIntervals[index];
      return lastKey;
    });
  },


  getCanonicalKeyString: function (keyString) {

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
    [keyString, flatDifference] = stripKey(keyString, "b");
    [keyString, sharpDifference] = stripKey(keyString, "#");

    const keyNumber = this.getKeyNumberForCanonicalKeyString(keyString) +
      sharpDifference -
      flatDifference;

    return this.getKeyStringForKeyNumber(keyNumber);
  },


  getKeyStringForKeyNumber: function (number) {
    return keyMap[number + ""];
  },

  keySignatureValueToString: function (value) {
    return keySignatures[value];
  },

  getModifierTypeOfKeySignature: function (keySignature) {
    const index = keySignatures.indexOf(keySignature);
    if (index < 7) {
      return "#";
    } else if (index > 7) {
      return "b";
    }
    return "";
  }
};
