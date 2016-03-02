import Chartist from "Chartist";
import React, {Component} from "react";
import StatisticService from "../services/statistic_service.js";
import KeyConverter from "../services/key_converter.js";

export default class StatisticsView extends Component {

  propTypes: {
    statisticService: React.PropTypes.object.isRequired
  }


  render() {
    const statistics = this.props.statisticService;
    return <div id="stats">
      <div id="text-stats">
        <h4>The last days you trained:</h4>
        <ul>
        {
            statistics.getLastDays(10).map(function (el){
            <li>
              { (el.averageTime / 1000).toFixed(2) }s average
              ({ (el.totalTime / 1000 / 60).toFixed(2) } min)
            </li>
          })
        }
        </ul>

        <h4>Average time: { (statistics.getAverageTimeOfLast(100) / 1000).toFixed(2) }s</h4>
        <h4>Played chords: { statistics.getTotalAmountOfChords() }</h4>
        <h4>Played notes: { statistics.getTotalAmountOfNotes() }</h4>
        <h4>Failure rate: { statistics.getFailureRate().toFixed(2) }</h4>
      </div>

      <div id="graph-stats">
        <div className="semi-transparent ct-chart ct-perfect-fourth"></div>
      </div>
    </div>;
  }


  ui() {
    return {
      "stats" : "#stats",
      "chart" : ".ct-chart"
    };
  }


  renderChart() {
    // TODO: find a better way to trigger the rendering

    var statistics = this.model.get("statistics");

    var data = {
      labels: [],
      series: [statistics.getLastTimes(100)]
    };

    var options = {
      showPoint : false,
      lineSmooth : false,
      axisX : {
        showGrid: false,
        showLabel: false
      },
      width: 400,
      height: 300
    };

    if (statistics.getSuccessCount() > 1) {
      Chartist.Line(this.ui.chart.get(0), data, options);
      return this.ui.stats.show();
    } else {
      return this.ui.stats.hide();
    }
  }
}
