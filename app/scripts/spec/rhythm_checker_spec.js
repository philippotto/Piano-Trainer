import RhythmChecker from "../services/rhythm_checker.js";

const tuplesToTimeObjects = ([a, b]) => ({startTime: a, endTime: b});
const inverse = (el) => 1 / el;

describe("RhythmChecker", function () {

  it("converts durations to times - without pauses", function () {
    const durations = [4, 4, 4, 2].map(inverse);
    const times = RhythmChecker.convertDurationsToTimes(durations);
    const expectedTimes = [
      [0, 0.25],
      [0.25, 0.5],
      [0.5, 0.75],
      [0.75, 1.25]
    ].map(tuplesToTimeObjects);

    expect(times).toEqual(expectedTimes);
  });

  it("converts durations to times - with pauses", function () {
    const durations = [4, -4, 2, 4].map(inverse);
    const times = RhythmChecker.convertDurationsToTimes(durations);
    const expectedTimes = [
      [0, 0.25],
      [0.5, 1.0],
      [1.0, 1.25]
    ].map(tuplesToTimeObjects);

    expect(times).toEqual(expectedTimes);
  });


  it("compares times within a given tolerance", function () {
    const expectedTimes = [
      [0, 0.25],
      [0.5, 1.0],
      [1.0, 1.25]
    ].map(tuplesToTimeObjects);

    const givenTimesCorrect = [
      [0, 0.23],
      [0.56, 0.96],
      [0.97, 1.30]
    ].map(tuplesToTimeObjects);

    expect(RhythmChecker.compare(expectedTimes, givenTimesCorrect)).toBe(true);


    const givenTimesFalse = [
      [0, 0.23],
      [0.33, 0.96],
      [0.97, 1.30]
    ].map(tuplesToTimeObjects);

    expect(RhythmChecker.compare(expectedTimes, givenTimesFalse)).toBe(true);

  });

});

