import StatisticService from "../services/pitch_statistic_service.js";
import StatEvolver from "../services/stat_evolver.js";

describe("StatEvolver", function () {

  const versions = [
    StatisticService.transformDate(JSON.parse(`{
      "success":true,
      "keys":["f/4","e/3","b/3","d/3"],
      "time": 14622,
      "date":"2016-03-01T23:59:04.462Z",
      "formattedDate":"2016-02-01"
    }`)),
    {
      success: true,
      keys: ["f/4","e/3","b/3","d/3"],
      time: 14622,
      date: new Date("2016-03-01T23:59:04.462Z"),
      version: 1,
    },
    {
      success: true,
      keys: ["f/4","e/3","b/3","d/3"],
      time: 14622,
      date: new Date("2016-03-01T23:59:04.462Z"),
      version: 2,
      keySignature: "C",
    }
  ];

  it("transforms from version 0 to 1", function () {
    const evolvedVersion1 = StatEvolver.runEvolution(versions[0], 0);
    expect(evolvedVersion1).toEqual(versions[1]);
  });

  it("transforms from version 1 to 2", function () {
    const evolvedVersion2 = StatEvolver.runEvolution(versions[1], 1);
    expect(evolvedVersion2).toEqual(versions[2]);
  });

  it("transforms from version 0 to latest", function () {
    const evolvedVersion = StatEvolver.evolveToLatestSchema(versions[0]);
    expect(evolvedVersion).toEqual(versions.slice(-1)[0]);
  });

});
