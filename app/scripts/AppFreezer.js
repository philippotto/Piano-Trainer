import Freezer from "freezer-js";

let defaultSettings = {
  pitchReading: {
    useAutomaticDifficulty: true,
    automaticDifficulty: {
      accuracyGoal: 0.85,
      timeGoal: 2000,
      amount: 5,
      newNotesShare: 0.6,
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
    },
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
  },
};

const savedSettings = localStorage.getItem("SheetMusicTutor-settings");
if (savedSettings) {
  const parsedSettings = JSON.parse(savedSettings);
  parsedSettings.pitchReading.midi.inputs = defaultSettings.pitchReading.midi.inputs;
  defaultSettings = parsedSettings;
}

const AppFreezer = new Freezer({
  settings: defaultSettings,
});

AppFreezer.on("update", () => {
  const settingsJson = JSON.stringify(AppFreezer.get().settings.toJS());
  localStorage.setItem("SheetMusicTutor-settings", settingsJson);
});

export default AppFreezer;
