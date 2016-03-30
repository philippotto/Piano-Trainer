import _ from "lodash";

export default {

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


  /*
     returns an evaluationObject which holds
      {
        beatEvaluations: [BeatEvaluation],
        missesBeat: Boolean,                 // the user missed a beat
        success: Boolean                     // the rhythm was tapped correctly
      }
     where a BeatEvaluation looks like
      {
        startDiff: Number,                   // difference in milliseconds
        endDiff: Number,
        superfluous: Boolean                 // true if beat was too much
      }
  */
  compare: function(expectedTimes, givenTimes, settings) {
    let missesBeat = false;
    let beatEvaluations = [];
    const barDuration = settings.barDuration;
    const shortestNote = this.getShortestNote(settings);

    console.log("expectedTimes", JSON.stringify(expectedTimes));
    console.log("givenTimes", JSON.stringify(givenTimes));

    const onTolerance = barDuration / (shortestNote * 2);
    const offTolerance = onTolerance * 2;
    for (let i = 0; i < expectedTimes.length; i++) {
      if (i >= givenTimes.length) {
        missesBeat = true;
        break;
      }

      const startDiff = expectedTimes[i][0] - givenTimes[i][0];
      const endDiff = expectedTimes[i][1] - givenTimes[i][1];
      let correct = true;
      if (Math.abs(startDiff) > onTolerance) {
        console.warn(expectedTimes[i][0], "-", givenTimes[i][0], " = ", startDiff);
        correct = false;
      }
      // positive time -> released too early -> be a bit more tolerant
      if (endDiff > offTolerance || endDiff < -1 * onTolerance) {
        console.warn(expectedTimes[i][1], "-", givenTimes[i][1], " = ", endDiff);
        correct = false;
      }
      beatEvaluations.push({ startDiff, endDiff, correct });
    }

    if (givenTimes.length > expectedTimes.length) {
      beatEvaluations = beatEvaluations.concat(
        givenTimes.slice(expectedTimes.length).map((el) => ({superfluous: true, correct: false}))
      );
    }

    return {
      beatEvaluations,
      missesBeat,
      success: beatEvaluations.every((el) => el.correct) && !missesBeat,
    };
  },

  getShortestNote(settings) {
    let shortestNote = 4;
    if (settings.eighthNotes) {
      shortestNote = 8;
    }
    if (settings.sixteenthNotes) {
      shortestNote = 16;
    }
    return shortestNote;
  }
};
