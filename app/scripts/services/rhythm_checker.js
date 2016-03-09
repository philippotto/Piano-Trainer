import _ from "lodash";

export default {

  convertNotesToTimes: function(notes) {
    const times = [];
    let lastTick = 0;

    for (let i = 0; i < notes.length; i++) {
      const currentNote = notes[i];
      let newLastTick;
      if (currentNote > 0) {
        newLastTick = lastTick + currentNote;
        times.push({
          startTime: lastTick,
          endTime: newLastTick
        });
      } else {
        newLastTick = lastTick + Math.abs(currentNote);
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
