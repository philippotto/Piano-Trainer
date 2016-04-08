import Freezer from "freezer-js";

export default new Freezer({
  settings: {
    pitchReading: {
      useAutomaticDifficulty: true,
      automaticDifficulty: {
        accuracyGoal: 0.85,
        timeGoal: 2000,
        amount: 5
      },
      chordSizeRanges: {
        treble: [1, 3],
        bass: [1, 3],
      },
      keySignature: [7, 7],
      useAccidentals: false,
      midi: {
        inputs: Freezer.createLeaf([]),
        activeInputIndex: 0,
      }
    },
    rhythmReading: {
      barDuration: 3000,
      labelBeats: true,
      liveBeatBars: false,
      rests: true,
      restProbability: 0.2,
      eighthNotes: true,
      sixteenthNotes: false,
      dottedNotes: false,
      triplets: false,
    }
  }
});
