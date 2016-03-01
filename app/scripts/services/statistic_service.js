/* define
 */

export default class StatisticService {

  constructor() {

    this.read();
    console.log("@stats",  this.stats);
  }


  register(evt) {

    /*
    an event could like
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
      this.stats = JSON.parse(this.stats);
      for (let el in this.stats) {
        el.date = new Date(el.date)
      }
    } else {
      return this.stats = [];
    }
  }



  save() {

    return localStorage.setItem("pianoTrainerStatistics", JSON.stringify(this.stats));
  }

  getSuccessCount() {

    return _(this.stats).filter(function(el) { return el.success; }).value().length;
  }


  getLastTimes(n = 10) {

    return _(this.stats).filter(function(el) { return el.success; }).pluck("time").last(n).value();
  }


  computeSum(array) {

    return _.reduce(
      array,
      function(a, b) { return a + b; },
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

    return _(this.stats).filter(function(el) { return el.success; }).pluck("keys").size();
  }


  getTotalAmountOfNotes() {

    return _(this.stats).filter(function(el) { return el.success; }).pluck("keys").flatten().size();
  }


  getFailureRate() {

    return _.filter(this.stats, function(el) { return el.success; }).length / this.stats.length;
  }


  getLastDays(n = 10) {

    return _(this.stats).filter(function(el) { return el.success; }).map(function(el) {
      el.formattedDate = [
        el.date.getUTCFullYear(),
        ("0" + el.date.getMonth()).slice(-2),
        ("0" + el.date.getDate()).slice(-2)
      ].join("-");
      return el;
    }
    ).groupBy("formattedDate").map((aDay, formattedDate) => {
      var dayTimes = _.pluck(aDay, "time");
      aDay.averageTime = this.computeAverage(dayTimes);
      aDay.totalTime = this.computeSum(dayTimes);
      aDay.formattedDate = formattedDate;
      return aDay;
    }
    ).sortBy("formattedDate").reverse().value();
  }


  getDataCount() {

    return this.stats.length;
  }
}

