import Freezer from "freezer-js";

export default new Freezer({
  settings: {
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
  }
});
