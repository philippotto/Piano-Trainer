import Chartist from "chartist";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import _ from "lodash";

import AnimatedNumber from "./animated_number.js";
import StarAnimation from "./star_animation.js";

export default class RhythmStatisticView extends Component {
  static propTypes = {
    statisticService: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
  }

  getHumanReadableTime(milliseconds) {
    const seconds = milliseconds / 1000;
    return [
      {
        amount: Math.floor(seconds / 31536000),
        unit: "y",
      },
      {
        amount: Math.floor((seconds % 31536000) / 86400),
        unit: "d",
      },
      {
        amount: Math.floor(((seconds % 31536000) % 86400) / 3600),
        unit: "h",
      },
      {
        amount: Math.floor((((seconds % 31536000) % 86400) % 3600) / 60),
        unit: "m",
      },
      {
        amount: (((seconds % 31536000) % 86400) % 3600) % 60,
        unit: "s",
      },
    ]
      .filter(el => el.amount !== 0)
      .map(el => `${Math.ceil(el.amount)} ${el.unit}`)
      .join(" ");
  }

  componentDidMount() {
    this.refreshFunction = this.forceUpdate.bind(this);
    this.props.statisticService.on("update", this.refreshFunction);
    this.drawDiagram();
  }

  componentDidUpdate() {
    this.drawDiagram();
  }

  componentWillUnmount() {
    this.props.statisticService.off("update", this.refreshFunction);
  }

  render() {
    const statistics = this.props.statisticService;
    if (statistics.getSuccessCount() === 0) {
      return <div />;
    }

    return (
      <div className="graph-stats content-box">
        <div
          ref={c => {
            this.chart = c;
          }}
          className="semi-transparent ct-chart ct-major-eleventh"
        />
        <div className="row around-xs">
          <div className="col-xs">
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id="avgTime">Your current score</Tooltip>}
            >
              <span className="stat-detail">
                <StarAnimation number={statistics.getCurrentScore()} />
                <AnimatedNumber number={statistics.getCurrentScore()} />
              </span>
            </OverlayTrigger>
          </div>
          <div className="col-xs">
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id="avgTime">Total time you played rhythms</Tooltip>}
            >
              <span className="stat-detail">
                <i className="fa fa-clock-o" />
                <AnimatedNumber
                  number={statistics.getTotalRhythmTime()}
                  formatter={this.getHumanReadableTime}
                />
              </span>
            </OverlayTrigger>
          </div>
          <div className="col-xs">
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id="playedChordsAndNotes">Played bars / played beats</Tooltip>}
            >
              <span className="stat-detail">
                <i className="fa fa-music" />
                <AnimatedNumber number={statistics.getTotalAmountOfRhythms()} />
                /
                <AnimatedNumber number={statistics.getTotalAmountOfBeats()} />
              </span>
            </OverlayTrigger>
          </div>
          <div className="col-xs">
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id="successRate">Success rate</Tooltip>}
            >
              <span className="stat-detail">
                <i className="fa fa-trophy" />
                <AnimatedNumber number={statistics.getSuccessRate() * 100} />
                %
              </span>
            </OverlayTrigger>
          </div>
        </div>
      </div>
    );
  }

  drawDiagram() {
    const statistics = this.props.statisticService;
    const currentScore = statistics.getCurrentScore();
    const lastScores = statistics.getLastScores(100);

    const scoreBeforeLastHundred = currentScore - _.sum(lastScores);

    const scoreDevelopmentValues = [scoreBeforeLastHundred];
    lastScores.forEach(el => {
      scoreDevelopmentValues.push(el + scoreDevelopmentValues.slice(-1)[0]);
    });

    const data = {
      labels: [],
      series: [scoreDevelopmentValues],
    };

    const options = {
      showPoint: false,
      lineSmooth: false,
      axisX: {
        showGrid: false,
        showLabel: false,
      },
      axisY: {
        labelInterpolationFnc: function(value) {
          return value;
        },
      },
    };

    if (this.chart && scoreDevelopmentValues.length > 1) {
      Chartist.Line(this.chart, data, options);
    }
  }
}
