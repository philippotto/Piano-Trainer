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

  generateEmptyRhythmBar: function() {
    return {
      keys: {
        treble: [],
        bass: []
      },
      durations: []
    };
  },

  generateRhythmBar: function(settings) {
    // const durations = [4, 2, -4, 4];

    const calcBarLength = (durations) => {
      return durations.map((el) => 1 / Math.abs(el)).reduce((a, b) => a + b, 0);
    }

    const generateRandomDurations = () => {
      const durations = [];
      while (calcBarLength(durations) < 1)  {
        const newDuration = _.sample(settings.durationOptions);
        if (calcBarLength(durations.concat(newDuration)) <= 1) {
          durations.push(newDuration);
        }
      }

      return _.shuffle(durations);
    }

    let durations = generateRandomDurations();
    while (durations.every((el) => el < 0)) {
      durations = generateRandomDurations();
    }

    // durations = _.sample([
    //   [4, 4, 4, 4],
    //   [4, -4, 4, 4],
    //   [2, 2],
    //   [4, 2, 4],
    //   [4, 2, -4],
    // ]);

    const staveNotes = durations.map((duration) =>
      new Vex.Flow.StaveNote({
        clef: "treble",
        keys: ["a/4"],
        duration: duration > 0 ? `${duration}` : `${duration}r`
      })
    );

    return {
      keys: {
        treble: staveNotes,
        bass: []
      },
      durations
    };
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
      chordsPerBar: 4,
      levels: {
        bass: [2, 3],
        treble: [4, 5]
      },
      maximumInterval: 12
    };

    const baseModifiers = settings.useAccidentals ?
      _.flatten([_.times(8, _.constant("")), "b", "#"])
      : [""];

    const generatedChords = _.range(0, options.chordsPerBar).map(() => {
      const randomLevel = _.sample(options.levels[clef]);

      const generateNote = function (baseNotes) {
        const randomNoteIndex = _.random(0, baseNotes.length - 1);
        const note = baseNotes.splice(randomNoteIndex, 1)[0];

        const modifier = _.sample(baseModifiers);
        return {note, modifier};
      };

      const generateNoteSet = () => {
        const baseNotes = getBaseNotes();
        return _.times(_.random.apply(_, chordSizeRanges[clef]), () => {
          return generateNote(baseNotes);
        });
      };

      const noteObjectToKeyString = ({note, modifier}) => note + modifier + "/" + randomLevel;

      const ensureInterval = (keyObjects) => {
        const keyNumbers = keyObjects.map((keyObject) => {
          return KeyConverter.getKeyNumberForKeyString(noteObjectToKeyString(keyObject), "C");
        });
        return options.maximumInterval >= _.max(keyNumbers) - _.min(keyNumbers);
      };

      let randomNoteSet = generateNoteSet();
      while (!ensureInterval(randomNoteSet)) {
        randomNoteSet = generateNoteSet();
      }

      const staveChord = new Vex.Flow.StaveNote({
        clef: clef,
        keys: randomNoteSet.map(noteObjectToKeyString).sort((keyA, keyB) => {
          return KeyConverter.getKeyNumberForKeyString(keyA, "C") -
            KeyConverter.getKeyNumberForKeyString(keyB, "C");
        }),
        duration: `${options.chordsPerBar}`
      });

      randomNoteSet.forEach(({note, modifier}, index) => {
        if (modifier) {
          staveChord.addAccidental(index, new Vex.Flow.Accidental(modifier));
        }
      });

      return staveChord;
    });

    return generatedChords;
  }

}
