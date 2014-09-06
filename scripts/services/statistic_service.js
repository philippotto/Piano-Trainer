(function() {
  define([], function() {
    var StatisticService;
    return StatisticService = (function() {
      function StatisticService() {
        this.read();
        console.log("@stats", this.stats);
      }

      StatisticService.prototype.register = function(evt) {

        /*
        an event could like
        {
          success : true
          keys : ["c#/4", "d#/4"]
          time : 0.5
        }
         */
        var timeThreshold;
        timeThreshold = 15000;
        if (evt.time > timeThreshold) {
          return;
        }
        evt.date = new Date();
        this.stats.push(evt);
        return this.save();
      };

      StatisticService.prototype.read = function() {
        var el, _i, _len, _ref, _results;
        this.stats = localStorage.getItem("pianoTrainerStatistics");
        if (this.stats) {
          this.stats = JSON.parse(this.stats);
          _ref = this.stats;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            el = _ref[_i];
            _results.push(el.date = new Date(el.date));
          }
          return _results;
        } else {
          return this.stats = [];
        }
      };

      StatisticService.prototype.save = function() {
        return localStorage.setItem("pianoTrainerStatistics", JSON.stringify(this.stats));
      };

      StatisticService.prototype.getLastTimes = function(n) {
        if (n == null) {
          n = 10;
        }
        return _(this.stats).filter(function(el) {
          return el.success;
        }).pluck("time").last(n).value();
      };

      StatisticService.prototype.computeSum = function(array) {
        return _.reduce(array, function(a, b) {
          return a + b;
        }, 0);
      };

      StatisticService.prototype.computeAverage = function(array) {
        return this.computeSum(array) / array.length;
      };

      StatisticService.prototype.getAverageTimeOfLast = function(n) {
        if (n == null) {
          n = 10;
        }
        return this.computeAverage(this.getLastTimes(n));
      };

      StatisticService.prototype.getTotalAmountOfChords = function() {
        return _(this.stats).filter(function(el) {
          return el.success;
        }).pluck("keys").size();
      };

      StatisticService.prototype.getTotalAmountOfNotes = function() {
        return _(this.stats).filter(function(el) {
          return el.success;
        }).pluck("keys").flatten().size();
      };

      StatisticService.prototype.getFailureRate = function() {
        return _.filter(this.stats, function(el) {
          return el.success;
        }).length / this.stats.length;
      };

      StatisticService.prototype.getLastDays = function(n) {
        if (n == null) {
          n = 10;
        }
        return _(this.stats).filter(function(el) {
          return el.success;
        }).map(function(el) {
          el.formattedDate = [el.date.getUTCFullYear(), el.date.getMonth(), el.date.getDay()].join("-");
          return el;
        }).groupBy("formattedDate").map((function(_this) {
          return function(aDay) {
            var dayTimes;
            dayTimes = _.pluck(aDay, "time");
            aDay.averageTime = _this.computeAverage(dayTimes);
            aDay.totalTime = _this.computeSum(dayTimes);
            return aDay;
          };
        })(this)).sortBy("formattedDate").reverse().value();
      };

      return StatisticService;

    })();
  });

}).call(this);
