import LevelService from "../services/level_service.js";

describe("LevelService", function() {
  it("getAllNotesUntilLevel", function() {
    expect(LevelService.getAllNotesUntilLevelIndex(1)).toEqual(["c/4", "d/4", "e/4"]);

    expect(LevelService.getAllNotesUntilLevelIndex(2)).toEqual(["c/4", "d/4", "e/4", "f/4", "g/4", "a/4"]);
  });

  it("isInLevel", function() {
    const events = [
      {
        success: true,
        keys: ["c/4", "d/4", "e/4", "f/4"],
        time: 1500
      },
      {
        success: true,
        keys: ["c/4", "d/4", "e/4", "g/4"],
        time: 1000
      },
      {
        success: false,
        keys: ["c/4", "d/4", "e/4", "a/4"],
        time: 1500
      }
    ];

    const positiveEvaluation = LevelService.assessLevel(events, LevelService.getLevelByIndex(0), {
      amount: 2,
      accuracy: 0.66,
      time: 1334
    });
    expect(positiveEvaluation.isInLevel).toBe(true);

    const negativeEvaluation = LevelService.assessLevel(events, LevelService.getLevelByIndex(0), {
      amount: 2,
      accuracy: 0.67,
      time: 1334
    });
    expect(negativeEvaluation.isInLevel).toBe(false);
  });
});
