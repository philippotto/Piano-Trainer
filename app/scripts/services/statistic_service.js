import _ from "lodash";
import StatEvolver from "../services/stat_evolver.js";

class StatisticService {

  constructor() {
    this.read();
  }


  register(evt) {
    /* an event could be something like
      {
        success : true
        keys : ["c#/4", "d#/4"]
        time : 0.5
      }
    */

    evt.date = new Date();

    this.stats.push(evt);
    return this.save();
  }

  read() {
    this.stats = localStorage.getItem("pianoTrainerStatistics");

    if (this.stats) {
      this.stats = JSON.parse(this.stats)
        .map(this.transformDate)
        .map(StatEvolver.evolveToLatestSchema);
    } else {
      this.stats = [];
    }
    this.save();
  }

  transformDate(el) {
    el.date = new Date(el.date);
    return el;
  }

  save() {
    return localStorage.setItem("pianoTrainerStatistics", JSON.stringify(this.stats));
  }


  getSuccessCount() {
    return _(this.stats).filter((el) => el.success).value().length;
  }


  getLastTimes(n = 10) {
    return this.stats
      .filter((el) => el.success)
      .map((el) => el.time)
      .slice(-n);
  }


  computeSum(array) {
    return _.reduce(
      array,
      (a, b) => a + b,
      0
    );
  }


  computeAverage(array) {
    return this.computeSum(array) / (array.length || 1);
  }


  getAverageTimeOfLast(n = 10) {
    return this.computeAverage(this.getLastTimes(n));
  }


  getTotalAmountOfChords() {
    return _(this.stats)
      .filter((el) => el.success)
      .map((el) => el.keys)
      .size();
  }


  getTotalAmountOfKeys() {
    return _(this.stats)
      .filter((el) => el.success)
      .map((el) => el.keys)
      .flatten()
      .size();
  }


  getSuccessRate() {
    return _.filter(this.stats, (el) => el.success).length / this.stats.length;
  }


  getLastDays() {
    return _(this.stats).filter((el) => el.success).groupBy(function (el) {
      return [
        el.date.getUTCFullYear(),
        ("0" + el.date.getMonth()).slice(-2),
        ("0" + el.date.getDate()).slice(-2)
      ].join("-");
    }).map((aDay, formattedDate) => {
      const dayTimes = aDay.map((el) => el.time);
      aDay.averageTime = this.computeAverage(dayTimes);
      aDay.totalTime = this.computeSum(dayTimes);
      aDay.formattedDate = formattedDate;
      return aDay;
    }).sortBy("formattedDate").reverse().value();
  }


  getDataCount() {
    return this.stats.length;
  }
}


export default new StatisticService();
