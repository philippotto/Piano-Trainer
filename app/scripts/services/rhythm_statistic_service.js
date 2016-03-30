import _ from "lodash";

const localStorageRhythmStatsKey = "SheetMusicTutor-RhythmStatistics";

class RhythmStatisticService {

  constructor() {
    this.read();
  }

  register(evt) {
    /* an event could be something like
      {
        success : true
        durations : [8, 8, 4, 2]
        barDuration : 3000,
        liveBeatBars : true,
        labelBeats : false,
      }
    */

    evt.date = new Date();

    this.stats.push(evt);
    return this.save();
  }

  read() {
    this.stats = localStorage.getItem(localStorageRhythmStatsKey);

    if (this.stats) {
      this.stats = JSON.parse(this.stats)
        .map(this.transformDate);
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
    return localStorage.setItem(localStorageRhythmStatsKey, JSON.stringify(this.stats));
  }


  getSuccessCount() {
    return _(this.stats).filter((el) => el.success).value().length;
  }

  getLastScores(n) {
    return this.stats.slice(-n).map(this.rateEvent);
  }

  getLastTimes(n = 10) {
    return this.stats
      .filter((el) => el.success)
      .map((el) => el.time)
      .slice(-n);
  }


  computeAverage(array) {
    return _.sum(array) / (array.length || 1);
  }


  getAverageTimeOfLast(n = 10) {
    return this.computeAverage(this.getLastTimes(n));
  }


  getTotalAmountOfRhythms() {
    return this.stats.length
  }


  getTotalAmountOfBeats() {
    return _(this.stats)
      .map((el) => el.durations)
      .flatten()
      .size();
  }

  getTotalRhythmTime() {
    return _.sum(this.stats.map((el) => el.barDuration));
  }

  rateEvent(event) {
    return Math.round([
      event.success ? 10 : 1,
      _.sum(event.durations.map((el) => Math.abs(el))),
      10e5 / (event.barDuration * event.barDuration),
      event.liveBeatBars ? 0.5 : 1,
      event.liveBeatBars && event.labelBeats ? 0.5 : 1
    ].reduce((a, b) => a * b, 1));
  }

  getCurrentScore() {
    return _.sum(this.stats.map(this.rateEvent));
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
      aDay.totalTime = _.sum(dayTimes);
      aDay.formattedDate = formattedDate;
      return aDay;
    }).sortBy("formattedDate").reverse().value();
  }


  getDataCount() {
    return this.stats.length;
  }
}

export default new RhythmStatisticService();
