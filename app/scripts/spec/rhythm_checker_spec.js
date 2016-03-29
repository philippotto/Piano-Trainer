import RhythmChecker from "../services/rhythm_checker.js";

describe("RhythmChecker", function () {

  it("converts durations to times - without rests", function () {
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

  it("converts durations to times - with rests", function () {
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

    const settings1 = {
      barDuration: 3000,
      eighthNotes: true,
      sixteenthNotes: false,
    };
    const result1 = RhythmChecker.compare(expectedTimes, givenTimesCorrect, settings1);

    expect(result1.success).toBe(true);

    const givenTimesImprecise = [
      [0, 230],
      [290, 960],
      [970, 1300]
    ];

    const result2 = RhythmChecker.compare(expectedTimes, givenTimesImprecise, settings1);

    expect(result2.success).toBe(false);
    expect(result2.missesBeat).toBe(false);

    const givenTimesTooMany = [
      [0, 250],
      [500, 1000],
      [1000, 1250],
      [1250, 1500]
    ];

    const result3 = RhythmChecker.compare(expectedTimes, givenTimesTooMany, settings1);
    expect(result3.success).toBe(false);
    expect(result3.missesBeat).toBe(false);
    expect(result3.beatEvaluations[3].superfluous).toBe(true);

    const givenTimesMissesBeat = [
      [0, 250],
      [500, 1000]
    ];
    const result4 = RhythmChecker.compare(expectedTimes, givenTimesMissesBeat, settings1);
    expect(result4.success).toBe(false);
    expect(result4.missesBeat).toBe(true);
  });

});

