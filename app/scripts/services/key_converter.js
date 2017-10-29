import _ from "lodash";

const scaleIntervals = [0, 2, 2, 1, 2, 2, 2];

// TODO: generate this
const keySignatureOffsets = {
  "C#": ["f", "c", "g", "d", "a", "e", "b"],
  "F#": ["f", "c", "g", "d", "a", "e"],
  B: ["f", "c", "g", "d", "a"],
  E: ["f", "c", "g", "d"],
  A: ["f", "c", "g"],
  D: ["f", "c"],
  G: ["f"],
  C: [],
  F: ["b"],
  Bb: ["b", "e"],
  Eb: ["b", "e", "a"],
  Ab: ["b", "e", "a", "d"],
  Db: ["b", "e", "a", "d", "g"],
  Gb: ["b", "e", "a", "d", "g", "c"],
  Cb: ["b", "e", "a", "d", "g", "c", "f"],
};

const keySignatures = [
  "C#",
  "F#",
  "B",
  "E",
  "A",
  "D",
  "G",
  "C",
  "F",
  "Bb",
  "Eb",
  "Ab",
  "Db",
  "Gb",
  "Cb",
];
const octaveNotes = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];

const keyMap = initializeKeyMap();

function initializeKeyMap() {
  // builds a keyMap which looks like this
  // {
  //   21 : "a/0"
  //   22 : "a#/0"
  //   ...
  //   108 : "c/8"
  // }

  const octaveNoteLength = octaveNotes.length;

  const claviatureOffset = -3;
  const octaveCount = 7;
  const claviature = octaveNotes
    .slice(claviatureOffset)
    .concat(_.flatten(_.times(octaveCount, () => octaveNotes)))
    .concat([octaveNotes[0]]);

  const newKeyMap = {};

  for (let index = 0, key; index < claviature.length; index++) {
    key = claviature[index];
    const offsettedIndex = index + claviatureOffset;
    const nr = Math.floor((offsettedIndex + octaveNoteLength) / octaveNoteLength);

    newKeyMap[index + 21] = key + "/" + nr;
  }

  return newKeyMap;
}

const KeyConverter = {
  getPitchRangeInclusive: function(keyA, keyB, includeAccidentals) {
    const keyArray = _.values(keyMap);
    return keyArray
      .slice(keyArray.indexOf(keyA), keyArray.indexOf(keyB) + 1)
      .filter(el => includeAccidentals || !this.hasAccidental(el));
  },

  hasAccidental: function(keyString) {
    return keyString.indexOf("#") > -1 || keyString.slice(1).indexOf("b") > -1;
  },

  getKeyNumberForCanonicalKeyString: function(keyString) {
    return parseInt(_.findKey(keyMap, key => key === keyString), 10);
  },

  getCanonicalKeySignature: function(keySignature) {
    const keyString = keySignature.toLowerCase() + "/1";
    const canonicalKeyString = KeyConverter.getCanonicalKeyString(keyString);
    return KeyConverter.getNoteFromKeyString(canonicalKeyString).toUpperCase();
  },

  getKeyNumberForKeyString: function(keyString, keySignature) {
    keyString = KeyConverter.getCanonicalKeyString(keyString);
    const keyNumber = KeyConverter.getKeyNumberForCanonicalKeyString(keyString);

    if (keySignature !== "C") {
      const note = KeyConverter.getNoteFromKeyString(keyString);
      const affectedBySignature = keySignatureOffsets[keySignature].indexOf(note) > -1;

      if (affectedBySignature) {
        const modifierType = KeyConverter.getModifierTypeOfKeySignature(keySignature);
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

  getScaleKeysForBase: function(baseKeyString) {
    // Returns canonical key strings.
    // For example, the last key of the f sharp major scale is e#
    // The function will return a f (which is harmonically seen the same)

    if (_.isString(baseKeyString)) {
      baseKeyString = KeyConverter.getKeyNumberForKeyString(baseKeyString, "C");
    }

    baseKeyString = parseInt(baseKeyString, 10);

    let lastKey = baseKeyString;

    return _.times(7, index => {
      lastKey += scaleIntervals[index];
      return lastKey;
    });
  },

  getCanonicalKeyString: function(keyString) {
    // strips away the given modifier and returns the strippedKey as well as the
    // amount of stripped modifiers
    const stripKey = function(keyToStrip, modifier) {
      const regexp = new RegExp(modifier, "g");
      // ignore the first character so we only strip b-signs and not b-notes
      const strippedKey = keyToStrip[0] + keyToStrip.slice(1).replace(regexp, "");
      const difference = keyToStrip.length - strippedKey.length;

      return [strippedKey, difference];
    };

    let flatDifference, sharpDifference;
    [keyString, flatDifference] = stripKey(keyString, "b");
    [keyString, sharpDifference] = stripKey(keyString, "#");

    const keyNumber =
      KeyConverter.getKeyNumberForCanonicalKeyString(keyString) + sharpDifference - flatDifference;

    return KeyConverter.getKeyStringForKeyNumber(keyNumber);
  },

  getKeyStringForKeyNumber: function(number) {
    return keyMap[number + ""];
  },

  keySignatureValueToString: function(value) {
    return keySignatures[value];
  },

  rateKeySignatureDifficulty: function(keySignature) {
    return keySignatureOffsets[keySignature].length + 1;
  },

  getModifierTypeOfKeySignature: function(keySignature) {
    const index = keySignatures.indexOf(keySignature);
    if (index < 7) {
      return "#";
    } else if (index > 7) {
      return "b";
    }
    return "";
  },

  getNoteFromKeyString: function(keyString) {
    return keyString.split("/")[0];
  },

  getNotesOutsideScale: function(keySignature) {
    const cScaleKeyNumbers = KeyConverter.getScaleKeysForBase(keySignature);
    const cScaleNotes = cScaleKeyNumbers
      .map(KeyConverter.getKeyStringForKeyNumber)
      .map(KeyConverter.getNoteFromKeyString);

    return _.difference(octaveNotes, cScaleNotes);
  },
};

export default KeyConverter;
