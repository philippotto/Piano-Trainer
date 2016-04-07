import _ from "lodash";

import KeyConverter from "../services/key_converter.js";

const baseNotes = "cdefgab".split("");

const options = {
  chordsPerBar: 4,
  levels: {
    bass: [2, 3],
    treble: [4, 5]
  },
  maximumInterval: 12
};

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
    const calcBarLength = (durations) => {
      return durations.map((el) => 1 / Math.abs(el)).reduce((a, b) => a + b, 0);
    }

    const generateRandomDurations = () => {
      const durations = [];
      while (calcBarLength(durations) < 1)  {
        const possibleNotes = _.flatten([
          [4, 2],
          settings.eighthNotes ? 8 : null,
          settings.sixteenthNotes ? 16 : null,
        ]);

        let newDuration = _.sample(possibleNotes);
        if (settings.rests && Math.random() < settings.restProbability) {
          newDuration *= -1;
        }
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

    // durations = [4, 2, -4, 4];

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
    const isMidiAvailable = settings.midi.inputs.get().length > 0;
    const onePerTime = isMidiAvailable;

    const [trebleNotes, bassNotes] = _.unzip(_.range(0, options.chordsPerBar).map((index) => {
      const [trebleAmount, bassAmount] = onePerTime ?
        ["treble", "bass"].map((el) =>
          _.random.apply(_, chordSizeRanges[clef])
        ) :
        _.sample([[0, 1], [1, 0]]);

      const generatePossibleNotes = (levels) => {
        return _.flatten(levels.map((noteLevel) =>
          baseNotes.map((el) => el + "/" + noteLevel)
        ));
      };

      return [
        this.generateNotesForBeat("treble", trebleAmount,
          generatePossibleNotes.bind(null, [4, 5])),
        this.generateNotesForBeat("bass", bassAmount,
          generatePossibleNotes.bind(null, [2, 3]))
      ];
    }));

    return {
      treble: trebleNotes,
      bass: bassNotes
    };
  },

  generateNote: function (possibleNotes) {
    const randomNoteIndex = _.random(0, possibleNotes.length - 1);
    const note = possibleNotes.splice(randomNoteIndex, 1)[0];

    return note;
  },

  generateNoteSet: function(amount, generatePossibleNotes) {
    const possibleNotes = _.clone(generatePossibleNotes());
    return _.times(amount, () => {
      return this.generateNote(possibleNotes);
    });
  },

  ensureInterval: function(keyStrings) {
    const keyNumbers = keyStrings.map((keyString) => {
      return KeyConverter.getKeyNumberForKeyString(keyString, "C");
    });
    return options.maximumInterval >= _.max(keyNumbers) - _.min(keyNumbers);
  },

  generateNotesForBeat(clef, amount, generatePossibleNotes) {
    if (amount === 0) {
      const rest = new Vex.Flow.StaveNote({
        clef: clef,
        keys: [clef === "treble" ? "a/4" : "c/3"],
        duration: `${options.chordsPerBar}r`
      });
      return rest;
    }

    let randomNoteSet = this.generateNoteSet(amount, generatePossibleNotes);
    while (!this.ensureInterval(randomNoteSet)) {
      randomNoteSet = this.generateNoteSet(amount, generatePossibleNotes);
    }

    const staveChord = new Vex.Flow.StaveNote({
      clef: clef,
      keys: randomNoteSet.sort((keyA, keyB) => {
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

  }

}
