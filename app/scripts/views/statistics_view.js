import Chartist from "Chartist";
import React, {Component} from "react";

export default class StatisticsView extends Component {

  propTypes: {
    statisticService: React.PropTypes.object.isRequired,
  }

  render() {
    const statistics = this.props.statisticService;
    if (statistics.getSuccessCount() === 0) {
      return <div />;
    }

    return (
      <div ref="stats">
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
          <h4>Success rate: { statistics.getSuccessRate().toFixed(2) }</h4>
        </div>

        <div id="graph-stats">
          <div ref="chart" className="semi-transparent ct-chart ct-perfect-fourth"></div>
        </div>
      </div>
    );
  }

  componentDidUpdate() {
    const statistics = this.props.statisticService;

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
      Chartist.Line(this.refs.chart, data, options);
    }
  }
}
