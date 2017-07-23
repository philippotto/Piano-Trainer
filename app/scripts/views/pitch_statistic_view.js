import Chartist from "Chartist";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import LevelView from "./level_view.js";
import CollapsableContainer from "./collapsable_container.js";

import AnimatedNumber from "./animated_number.js";
import StarAnimation from "./star_animation.js";

export default class PitchStatisticView extends Component {
  static propTypes = {
    statisticService: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired
  };

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
            <OverlayTrigger placement="top" overlay={<Tooltip id="avgTime">Your current score</Tooltip>}>
              <span className="stat-detail">
                <StarAnimation number={statistics.getCurrentScore()} />
                <AnimatedNumber number={statistics.getCurrentScore()} />
              </span>
            </OverlayTrigger>
          </div>
          <div className="col-xs">
            <OverlayTrigger placement="top" overlay={<Tooltip id="avgTime">Average time</Tooltip>}>
              <span className="stat-detail">
                <i className="fa fa-clock-o" />
                <AnimatedNumber
                  number={statistics.getAverageTimeOfLast(100) / 1000}
                  formatter={el => el.toFixed(2) + "s"}
                />
              </span>
            </OverlayTrigger>
          </div>
          <div className="col-xs">
            <OverlayTrigger placement="top" overlay={<Tooltip id="playedChordsAndNotes">Played notes</Tooltip>}>
              <span className="stat-detail">
                <i className="fa fa-music" />
                <AnimatedNumber number={statistics.getTotalAmountOfKeys()} />
              </span>
            </OverlayTrigger>
          </div>
          <div className="col-xs">
            <OverlayTrigger placement="top" overlay={<Tooltip id="successRate">Success rate</Tooltip>}>
              <span className="stat-detail">
                <i className="fa fa-trophy" />
                <AnimatedNumber number={statistics.getSuccessRate()} formatter={el => el.toFixed(2) * 100} />
                %
              </span>
            </OverlayTrigger>
          </div>
        </div>
        <CollapsableContainer collapsed={!this.props.settings.useAutomaticDifficulty}>
          <LevelView statisticService={this.props.statisticService} />
        </CollapsableContainer>
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
      axisY: {
        labelInterpolationFnc: function(value) {
          return value / 1000 + "s";
        }
      }
    };

    if (this.chart && statistics.getSuccessCount() > 1) {
      Chartist.Line(this.chart, data, options);
    }
  }
}
