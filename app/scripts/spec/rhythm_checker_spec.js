import RhythmChecker from "../services/rhythm_checker.js";

describe("RhythmChecker", function () {

  it("converts durations to times - without pauses", function () {
    const durations = [4, 4, 4, 2];
    const times = RhythmChecker.convertDurationsToTimes(durations, 1000);
    const expectedTimes = [
      [0, 250],
      [250, 500],
      [500, 750],
      [750, 1250]
    ];

    expect(times).toEqual(expectedTimes);
  });

  it("converts durations to times - with pauses", function () {
    const durations = [4, -4, 2, 4];
    const times = RhythmChecker.convertDurationsToTimes(durations, 1000);
    const expectedTimes = [
      [0, 250],
      [500, 1000],
      [1000, 1250]
    ];

    expect(times).toEqual(expectedTimes);
  });


  it("compares times within a given tolerance", function () {
    const expectedTimes = [
      [0, 250],
      [500, 1000],
      [1000, 1250]
    ];

    const givenTimesCorrect = [
      [0, 230],
      [560, 960],
      [970, 1300]
    ];

    expect(RhythmChecker.compare(expectedTimes, givenTimesCorrect).success).toBe(true);

    const givenTimesFalse = [
      [0, 230],
      [290, 960],
      [970, 1300]
    ];

    expect(RhythmChecker.compare(expectedTimes, givenTimesFalse).success).toBe(false);
  });

});

