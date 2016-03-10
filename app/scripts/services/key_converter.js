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

  getNumberForCanonicalKeyString: function (keyString) {
    return parseInt(_.findKey(keyMap, (key) => key === keyString), 10);
  },


  getNumberForKeyString: function (keyString, keySignature) {
    keyString = this.getCanonicalForm(keyString);
    const keyNumber = this.getNumberForCanonicalKeyString(keyString);

    if (keySignature !== "C") {
      // find out whether keyNumber is affected by keySignature
      // if yes, increment/decrement it accordingly
      const scaleNotes = this.getScaleForBase(keySignature.toLowerCase() + "/1").map((el) =>
        this.getKeyStringForNumber(el).split("/")[0]
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


  getScaleForBase: function (baseKey) {
    // Returns canonical key strings.
    // For example, the last key of the f sharp major scale is e#
    // The function will return a f (which is harmonically seen the same)

    if (_.isString(baseKey)) {
      baseKey = this.getNumberForKeyString(baseKey, "C");
    }

    baseKey = parseInt(baseKey, 10);

    let lastNote = baseKey;

    return _.times(7, (index) => {
      lastNote += scaleIntervals[index];
      return lastNote;
    });
  },


  getCanonicalForm: function (key) {
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
  },


  getKeyStringForNumber: function (number) {
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
