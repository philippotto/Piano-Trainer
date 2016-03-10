import _ from "lodash";

import KeyConverter from "../services/key_converter.js";

function getBaseNotes() {
  return "cdefgab".split("");
}

export default {

  generateKeySignature: function(settings) {
    const keySignatureIndex = _.sample(
      _.range(settings.keySignature[0], settings.keySignature[1] + 1)
    );
    return KeyConverter.keySignatureValueToString(keySignatureIndex);
  },

  generateBars: function(settings) {
    return {
      treble: this.generateBar("treble", settings),
      bass: this.generateBar("bass", settings)
    };
  },

  generateBar: function(clef, settings) {
    const chordSizeRanges = settings.chordSizeRanges;
    const options = {
      notesPerBar: 4,
      levels: {
        bass: [2, 3],
        treble: [4, 5]
      },
      maximumInterval: 12
    };

    const baseModifiers = settings.useAccidentals ?
      _.flatten([_.times(8, _.constant("")), "b", "#"])
      : [""];

    const generatedChords = _.range(0, options.notesPerBar).map(() => {
      const randomLevel = _.sample(options.levels[clef]);

      const generateNote = function (baseNotes) {
        const randomNoteIndex = _.random(0, baseNotes.length - 1);
        const note = baseNotes.splice(randomNoteIndex, 1)[0];

        const modifier = _.sample(baseModifiers);
        return {note, modifier};
      };

      const generateChord = () => {
        const baseNotes = getBaseNotes();
        return _.times(_.random.apply(_, chordSizeRanges[clef]), () => {
          return generateNote(baseNotes);
        });
      };

      const formatKey = ({note, modifier}) => note + modifier + "/" + randomLevel;

      const ensureInterval = (keys) => {
        const keyNumbers = keys.map((key) => {
          return KeyConverter.getNumberForKeyString(formatKey(key), "C");
        });
        return options.maximumInterval >= _.max(keyNumbers) - _.min(keyNumbers);
      };

      let randomChord = generateChord();
      while (!ensureInterval(randomChord)) {
        randomChord = generateChord();
      }

      const staveChord = new Vex.Flow.StaveNote({
        clef: clef,
        keys: randomChord.map(formatKey).sort((keyA, keyB) => {
          return KeyConverter.getNumberForKeyString(keyA, "C") -
            KeyConverter.getNumberForKeyString(keyB, "C");
        }),
        duration: `${options.notesPerBar}`
      });

      randomChord.forEach(({note, modifier}, index) => {
        if (modifier) {
          staveChord.addAccidental(index, new Vex.Flow.Accidental(modifier));
        }
      });

      return staveChord;
    });

    return generatedChords;
  }

}
