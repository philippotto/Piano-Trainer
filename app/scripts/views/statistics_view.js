import Chartist from "Chartist";
import React, {Component} from "react";
import StatisticService from "../services/statistic_service.js";
import KeyConverter from "../services/key_converter.js";

export default class StatisticsView extends Component {

  propTypes: {
    statisticService: React.PropTypes.object.isRequired,
  }

  render() {
    const statistics = this.props.statisticService;
    return (
      <div id="stats">
        <div id="text-stats">
          <h4>The last days you trained:</h4>
          <ul>
          {
            statistics.getLastDays(10).map((el, idx) =>
              <li key={idx}>
                { (el.averageTime / 1000).toFixed(2) }s average
                ({ (el.totalTime / 1000 / 60).toFixed(2) } min)
              </li>
            )
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
      </div>
    );
  }


  // ui() {
  //   return {
  //     "stats" : "#stats",
  //     "chart" : ".ct-chart"
  //   };
  // }


  renderChart() {
    // TODO: find a better way to trigger the rendering

    const statistics = this.model.get("statistics");

    const data = {
      labels: [],
      series: [statistics.getLastTimes(100)]
    };

    const options = {
      showPoint: false,
      lineSmooth: false,
      axisX: {
        showGrid: false,
        showLabel: false
      },
      width: 400,
      height: 300
    };

    if (statistics.getSuccessCount() > 1) {
      Chartist.Line(this.ui.chart.get(0), data, options);
      return this.ui.stats.show();
    }
    return this.ui.stats.hide();
  }
}
