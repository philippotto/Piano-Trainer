import _ from "lodash";

export default {

  reasons: {
    wrongLength: "wrong length",
    wrongStartBeat: "wrong start beat",
    wrongEndBeat: "wrong end beat",
  },

  convertDurationsToTimes: function(durations, barDuration) {
    const times = [];
    let lastTick = 0;

    const inversedDurations = durations.map((el) => 1 / el);

    for (let i = 0; i < inversedDurations.length; i++) {
      const currentDuration = inversedDurations[i];
      let newLastTick;
      if (currentDuration > 0) {
        newLastTick = lastTick + currentDuration;
        times.push([
          lastTick * barDuration,
          newLastTick * barDuration
        ]);
      } else {
        newLastTick = lastTick + Math.abs(currentDuration);
      }
      lastTick = newLastTick;
    }
    return times;
  },

  compare: function(expectedTimes, givenTimes) {
    if (expectedTimes.length !== givenTimes.length) {
      console.warn("different length");
      return {
        success: false,
        reason: this.reasons.wrongLength
      };
    }

    console.log("expectedTimes", JSON.stringify(expectedTimes));
    console.log("givenTimes", JSON.stringify(givenTimes));

    const tolerance = 200 * 0.99;
    for (let i = 0; i < expectedTimes.length; i++) {
      if (Math.abs(expectedTimes[i][0] - givenTimes[i][0]) > tolerance) {
        console.warn(expectedTimes[i][0], "-", givenTimes[i][0], " = ", expectedTimes[i][0] - givenTimes[i][0]);
        return {
          success: false,
          reason: this.reasons.wrongStartBeat,
          wrongBeat: i
        };
      }
      if (Math.abs(expectedTimes[i][1] - givenTimes[i][1]) > tolerance * 2.5) {
        console.warn(expectedTimes[i][1], "-", givenTimes[i][1], " = ", expectedTimes[i][1] - givenTimes[i][1]);
        return {
          success: false,
          reason: this.reasons.wrongEndBeat,
          wrongBeat: i
        };
      }
    }
    return {
      success: true
    };
  },
};
