(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["jquery", "backbone", "services/statistic_service", "services/key_converter", "Chartist"], function($, Backbone, StatisticService, KeyConverter, Chartist) {
    var StatisticsView;
    return StatisticsView = (function(_super) {
      __extends(StatisticsView, _super);

      function StatisticsView() {
        return StatisticsView.__super__.constructor.apply(this, arguments);
      }

      StatisticsView.prototype.className = "row";

      StatisticsView.prototype.template = _.template("\n<% if(statistics.getDataCount() > 0) { %>\n\n  <div id=\"text-stats\">\n    <h4>The last days you trained:</h4>\n    <ul>\n      <% statistics.getLastDays(10).map(function(el){ %>\n        <li><%= (el.averageTime / 1000).toFixed(2) %>s average\n          (<%= (el.totalTime / 1000 / 60).toFixed(2) %> min)\n        </li>\n      <% }) %>\n    </ul>\n\n    <h4>Average time: <%= (statistics.getAverageTimeOfLast(100) / 1000).toFixed(2) %>s</h4>\n    <h4>Played chords: <%= statistics.getTotalAmountOfChords() %></h4>\n    <h4>Played notes: <%= statistics.getTotalAmountOfNotes() %></h4>\n    <h4>Failure rate: <%= statistics.getFailureRate().toFixed(2) %></h4>\n  </div>\n\n  <div id=\"graph-stats\">\n    <div class=\"semi-transparent ct-chart ct-perfect-fourth\"></div>\n  </div>\n\n<% } %>");

      StatisticsView.prototype.ui = {
        "canvas": "canvas",
        "chart": ".ct-chart"
      };

      StatisticsView.prototype.onBeforeRender = function() {
        this.model = new Backbone.Model();
        return this.model.set("statistics", this.options.statisticService);
      };

      StatisticsView.prototype.renderChart = function() {
        var data, options, statistics;
        statistics = this.model.get("statistics");
        if (statistics.getDataCount() === 0) {
          return;
        }
        data = {
          labels: [],
          series: [statistics.getLastTimes(100)]
        };
        options = {
          showPoint: false,
          lineSmooth: false,
          axisX: {
            showGrid: false,
            showLabel: false
          },
          width: 400,
          height: 300
        };
        return Chartist.Line(this.ui.chart.get(0), data, options);
      };

      return StatisticsView;

    })(Backbone.Marionette.ItemView);
  });

}).call(this);
