import KeyConverter from "./key_converter";
import _ from "lodash";
import AppFreezer from "../AppFreezer.js";

const r = KeyConverter.getPitchRangeInclusive.bind(KeyConverter);

const levelGroups = [
  {
    base: {
      clef: "treble",
      signature: "C",
      accidentals: false,
    },
    sublevels: [
      r("c/4", "e/4"),
      r("f/4", "a/4"),
      r("b/4", "d/5"),
      r("e/5", "g/5"),
      r("a/5", "c/6"),

      // very high and very low end should also go here
    ]
  },
  {
    base: {
      clef: "bass",
      signature: "C",
      accidentals: false,
    },
    sublevels: [
      r("c/2", "e/2"),
      r("f/2", "a/2"),
      r("b/2", "d/3"),
      r("e/3", "g/3"),
      r("a/3", "c/4"),

      // very high and very low end should also go here
    ]
  }
];

const Levels = _.flatMap(levelGroups, (levelGroup) => {
  return levelGroup.sublevels.map((sublevel) => {
    const level = _.assign({}, levelGroup.base, {
      keys: {
        "treble": levelGroup.base.clef === "treble" ? sublevel : [],
        "bass": levelGroup.base.clef === "bass" ? sublevel : [],
      }
    });
    delete level.clef;
    return level;
  });
});
Levels.forEach((level, index) => {
  level.index = index;
});


const LevelService = {
  getLevelByIndex(index) {
    return Levels[index];
  },
  getAllNotesUntilLevelIndex(levelIndex) {
    return _.flatten(
      _.range(levelIndex).map((levelIndex) => {
        const keys = Levels[levelIndex].keys;
        return [].concat(keys.treble, keys.bass);
      })
    );
  },
  getLevelOfUser(events) {
    // check for each level if the user meets all necessary conditions
    let levelIndex = 0;
    while (levelIndex < Levels.length
      && this.isInLevelIndex(events, levelIndex)) {
      levelIndex++;
    }
    return levelIndex - 1;
  },
  getNotesOfLevel(level) {
    return [].concat(level.keys.treble, level.keys.bass);
  },
  levelContainsKey(level, key) {
    return level.keys.treble.indexOf(key) > -1 || level.keys.bass.indexOf(key) > -1;
  },
  isInLevelIndex(events, levelIndex) {
    return this.assessLevel(events, this.getLevelByIndex(levelIndex)).isInLevel;
  },
  assessLevel(events, level, optThresholds) {
    // 1. for each note of the current level, there should be at least X success
    //    events
    // 2. the last 100 (or less) success events of each note should have
    //    average time of < Y s
    //    success rate > Z

    const thresholdSettings = AppFreezer.get().settings.pitchReading.automaticDifficulty;

    optThresholds = optThresholds || {
      amount: thresholdSettings.amount,
      accuracy: thresholdSettings.accuracyGoal,
      time: thresholdSettings.timeGoal
    };
    const unfoldedEvents = _.flatMap(events, (event) => {
      return event.keys.map((key) => {
        const subEvent = {
          ...event,
          key
        };
        delete subEvent.keys;
        return subEvent;
      });
    });
    const filteredEvents = unfoldedEvents.filter((event) =>
      this.levelContainsKey(level, event.key)
    );

    const eventsByKey = _.groupBy(filteredEvents, "key");
    if (_.size(eventsByKey) < this.getNotesOfLevel(level)) {
      return false;
    }
    const evaluation = _.map(eventsByKey, (events, key) => {
      const successPartition = _.partition(events, "success")[0];

      const eventsLength = events.length;
      const accuracy = successPartition.length / events.length;
      const time = _.sum(successPartition.map((el) => el.time)) / successPartition.length;

      const meetsLength = eventsLength >= optThresholds.amount;
      const meetsAccuracy = accuracy >= optThresholds.accuracy;
      const meetsTime = time <= optThresholds.time;

      return {
        key,
        meetsLength,
        meetsAccuracy,
        meetsTime,
        isGoodEnough: meetsLength && meetsAccuracy && meetsTime,
        details : {
          eventsLength,
          time,
          accuracy,
          thresholds: optThresholds
        }
      };
    });
    console.log("evaluation",  evaluation);
    const goodEnoughPartition = _.partition(evaluation, (el) => el.isGoodEnough);
    return {
      goodEnoughKeys: goodEnoughPartition[0],
      notGoodEnoughKeys: goodEnoughPartition[1],
      isInLevel: goodEnoughPartition[1].length === 0 && evaluation.length > 0
    };
  }
};

export default LevelService;
