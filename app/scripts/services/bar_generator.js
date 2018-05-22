import _ from "lodash";

import KeyConverter from "../services/key_converter.js";
import LevelService from "../services/level_service.js";
import Vex from "vexflow";

const baseNotes = "cdefgab".split("");

const options = {
  chordsPerBar: 4,
  levels: {
    bass: [2, 3],
    treble: [4, 5],
  },
  maximumInterval: 12,
};

function sampleWithoutReplacement(options) {
  const randomOptionIndex = _.random(0, options.length - 1);
  const option = options.splice(randomOptionIndex, 1)[0];
  return option;
}

function randomInvokeAOrB(probability, functionA, functionB) {
  if (Math.random() < probability) {
    return functionA();
  }
  return functionB();
}

export default {
  generateKeySignature: function(settings) {
    const keySignatureIndex = _.sample(
      _.range(settings.keySignature[0], settings.keySignature[1] + 1),
    );
    return KeyConverter.keySignatureValueToString(keySignatureIndex);
  },

  generateEmptyRhythmBar: function() {
    return {
      keys: {
        treble: [],
        bass: [],
      },
      durations: [],
    };
  },

  generateRhythmBar: function(settings) {
    const calcBarLength = durations => {
      return durations.map(el => 1 / Math.abs(el)).reduce((a, b) => a + b, 0);
    };

    const generateRandomDurations = () => {
      const durations = [];
      while (calcBarLength(durations) < 1) {
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
    };

    let durations = generateRandomDurations();
    while (durations.every(el => el < 0)) {
      durations = generateRandomDurations();
    }

    // durations = [4, 2, -4, 4];

    const staveNotes = durations.map(
      duration =>
        new Vex.Flow.StaveNote({
          clef: "treble",
          keys: ["a/4"],
          duration: duration > 0 ? `${duration}` : `${duration}r`,
        }),
    );

    return {
      keys: {
        treble: staveNotes,
        bass: [],
      },
      durations,
    };
  },

  getClefAmounts: function(settings, onePerTime, level) {
    const getTrebleProbability = () => {
      const amounts = {
        new: level.keys.treble.concat(level.keys.bass).length,
        old: LevelService.getAllNotesUntilLevelIndex(level.index).length,
        trebleAndNew: level.keys.treble.length,
        trebleAndOld: LevelService.getAllNotesUntilLevelIndex(level.index, "treble").length,
      };
      if (amounts.new === amounts.trebleAndNew && amounts.old === amounts.trebleAndOld) {
        // there are no bass notes
        return 1;
      }

      const frequencies = {
        new: settings.automaticDifficulty.newNotesShare,
        trebleGivenNew: amounts.trebleAndNew / (amounts.new || 1),
        trebleGivenOld: amounts.trebleAndOld / (amounts.old || 1),
      };
      const trebleProbability =
        frequencies.trebleGivenNew * frequencies.new +
        frequencies.trebleGivenOld * (1 - frequencies.new);
      return trebleProbability;
    };

    if (onePerTime) {
      if (level) {
        const trebleProbability = getTrebleProbability();
        if (Math.random() <= trebleProbability) {
          return [1, 0];
        }
        return [0, 1];
      }
      const lengths = {
        treble: _.max(settings.chordSizeRanges.treble),
        bass: _.max(settings.chordSizeRanges.bass),
      };
      if (lengths.treble > 0 && lengths.bass > 0) {
        return _.sample([[0, 1], [1, 0]]);
      }
      if (lengths.treble === 0) {
        return [0, 1];
      }
      return [1, 0];
    }
    if (level) {
      // todo: handle possibility that a level doesn't demand the onePerTime limit
      return this.getClefAmounts(settings, true, level);
    }
    return ["treble", "bass"].map(clef => _.random.apply(_, settings.chordSizeRanges[clef]));
  },

  generateBars: function(settings, keySignature, level, onePerTime) {
    const [trebleNotes, bassNotes] = _.unzip(
      _.range(0, options.chordsPerBar).map(() => {
        const generatePossibleNotes = clef => {
          if (level) {
            return {
              new: _.filter(level.keys[clef],
                k => k >= settings.noteRange[0] && k <= settings.noteRange[1]),
              old: _.filter(LevelService.getAllNotesUntilLevelIndex(level.index, clef),
                k => k >= settings.noteRange[0] && k <= settings.noteRange[1]),
            };
          }
          const midiNotesInClef = clef === "treble" ?
            _.range(60 /* C4 */, 84/* C6 */) : _.range(36 /* C2 */, 60/* C6 */);
          const midiNotesInKeyRange = _.filter(midiNotesInClef,
            k => k >= settings.noteRange[0] && k <= settings.noteRange[1]);
          const keySignatureOffset = 
            KeyConverter.getKeyNumberForCanonicalKeyString(keySignature.toLowerCase() + "/1") - 24 /* C1 */;
          const midiNotesInKey = _.filter(midiNotesInKeyRange, 
            k => _.some([0,2,4,5,7,9,11], x => x === (k - keySignatureOffset) % 12));
          return midiNotesInKey;
        };

        const [possibleTrebleNotes, possibleBassNotes] = [
          generatePossibleNotes("treble"),
          generatePossibleNotes("bass"),
        ];

        const [trebleAmount, bassAmount] = this.getClefAmounts(settings, onePerTime, level);

        // trebleAmount bassAmount
        // if length === 0 then amounts cannot be more than 0

        return [
          this.generateNotesForBeat(settings, "treble", trebleAmount, possibleTrebleNotes,
            keySignature),
          this.generateNotesForBeat(settings, "bass", bassAmount, possibleBassNotes,
            keySignature),
        ];
      }),
    );

    return {
      treble: trebleNotes,
      bass: bassNotes,
    };
  },

  generateNoteSet: function(settings, amount, _possibleNotes) {
    if (_.isArray(_possibleNotes)) {
      if (_possibleNotes.length === 0) {
        return [];
      }
      const possibleNotes = _.clone(_possibleNotes);

      return _.times(amount, () => {
        return sampleWithoutReplacement(possibleNotes);
      });
    }

    if (_possibleNotes.new.length === 0 && _possibleNotes.old.length === 0) {
      return [];
    }

    const newPossibleNotes = _.clone(_possibleNotes.new);
    const oldPossibleNotes = _.clone(_possibleNotes.old);

    return _.times(amount, () => {
      const bothOptionsAreNotEmpty = newPossibleNotes.length > 0 && oldPossibleNotes.length > 0;
      const newNoteProbability = bothOptionsAreNotEmpty
        ? settings.automaticDifficulty.newNotesShare
        : newPossibleNotes.length > 0 ? 1 : 0;

      return randomInvokeAOrB(
        newNoteProbability,
        () => sampleWithoutReplacement(newPossibleNotes),
        () => sampleWithoutReplacement(oldPossibleNotes),
      );
    });
  },

  ensureInterval: function(keyNums) {
    if (keyNums.length < 1) {
      debugger; // If we don't drop to the debugger this will lead to an infinite loop.
    }
    return options.maximumInterval >= _.max(keyNums) - _.min(keyNums);
  },

  // Returns notes as Vex Flow StaveNotes
  generateNotesForBeat(settings, clef, amount, possibleNotes, keySignature) {
    let randomNoteSet = this.generateNoteSet(settings, amount, possibleNotes);

    if (amount === 0 || randomNoteSet.length === 0) {
      const rest = new Vex.Flow.StaveNote({
        clef: clef,
        keys: [clef === "treble" ? "a/4" : "c/3"],
        duration: `${options.chordsPerBar}r`,
      });
      return rest;
    }

    while (!this.ensureInterval(randomNoteSet)) {
      randomNoteSet = this.generateNoteSet(settings, amount, possibleNotes);
    }

    const staveChord = new Vex.Flow.StaveNote({
      clef: clef,
      keys: randomNoteSet.sort((keyA, keyB) => {
        return (keyA - keyB);
      }).map(x => KeyConverter.getKeyStringForKeyNumberWithSignature(x, keySignature)),
      duration: `${options.chordsPerBar}`,
    });

    // TODO(rofer): Figure out the right way to add accidentals back in
    //randomNoteSet.forEach(({ note, modifier }, index) => {
    //  if (modifier) {
    //    staveChord.addAccidental(index, new Vex.Flow.Accidental(modifier));
    //  }
    //});

    return staveChord;
  },
};
