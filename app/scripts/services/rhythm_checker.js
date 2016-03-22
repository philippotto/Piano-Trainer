import _ from "lodash";

export default {

  convertDurationsToTimes: function(durations) {
    const times = [];
    let lastTick = 0;

    for (let i = 0; i < durations.length; i++) {
      const currentDuration = durations[i];
      let newLastTick;
      if (currentDuration > 0) {
        newLastTick = lastTick + currentDuration;
        times.push({
          startTime: lastTick,
          endTime: newLastTick
        });
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
      return false;
    }
    const tolerance = 0.125 * 0.99;
    for (let i = 0; i < expectedTimes.length; i++) {
      if (Math.abs(expectedTimes[i] - givenTimes[i]) > tolerance) {
        console.warn(expectedTimes[i], "-", givenTimes[i], " = ", expectedTimes[i] - givenTimes[i]);
        return false;
      }
    }
    return true;
  },
};
