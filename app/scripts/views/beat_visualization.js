import React, {Component} from "react";
import classNames from "classnames";
import _ from "lodash";

import RhythmChecker from "../services/rhythm_checker.js";


export default class BeatVisualization extends Component {

  propTypes: {
    settings: React.PropTypes.object.isRequired,
    currentRhythm: React.PropTypes.object.isRequired,
    beatHistory: React.PropTypes.object.isRequired,
    result: React.PropTypes.object.isRequired,
  }

  convertTicksToBeatNames(tickTime, tickLength) {
    const tickTimeToIndexFactor = 1/16 * 100;
    const tickIndex = tickTime / tickTimeToIndexFactor;
    const tickStepCount = tickLength / tickTimeToIndexFactor;
    const allBeatNames = ['1', 'e', '&', 'a', '2', 'e', '&', 'a', '3', 'e', '&', 'a', '4', 'e', '&', 'a'];
    const ticks = allBeatNames.slice(tickIndex, tickIndex + tickStepCount);
    return <div className="row center-xs">
      {ticks.map((beatName, index) =>
        <div className="col-xs" key={index}>{beatName}</div>
      )}
    </div>;
  };

  render() {
    // if (this.state.phase === Phases.welcome) {
    //   return null;
    // }
    const barDuration = this.props.settings.barDuration;
    const conversionFactor = 100 / barDuration;

    const drawBeats = (beats, getColor, withBeatNames) => {
      let currentX = 0;
      const createBeat = (x, width, color, index) => {
        const marginLeft = x - currentX;
        let beatNamesRest = "-"; // fix for wrong rendering when bars are empty
        let beatNames = "-";
        if (withBeatNames) {
          beatNamesRest = this.convertTicksToBeatNames(currentX, x - currentX);
          beatNames = this.convertTicksToBeatNames(x, width);
        }
        currentX = x + width;

        return [
          marginLeft > 0 ?
            <div
              className="beat restBeat"
              style={{width: `${marginLeft}%`}}
              key={"spacer-${index}"}
            >{beatNamesRest}</div>
          : null,
          <div
            className="beat"
            style={{width: `${width}%`, backgroundColor: color}}
            key={index}
          >{beatNames}</div>
        ];
      };

      return beats.map((beat, index) => {
        const a = beat[0] * conversionFactor;
        const b = beat[1] * conversionFactor;
        const width = b - a;

        return _.flatten(createBeat(a, width, getColor(index), index));
      });
    };
    const expectedTimes = RhythmChecker.convertDurationsToTimes(
      this.props.currentRhythm.durations,
      barDuration
    );

    const expectedBeats = drawBeats(
      expectedTimes,
      _.constant("gray"),
      true
    );

    const actualBeats = drawBeats(this.props.beatHistory, (index) => {
      const result = this.props.result;
      if (result.success) {
        return "green";
      }
      if (result.reason === RhythmChecker.reasons.wrongLength) {
        return "red";
      }
      if (index < result.wrongBeat) {
        return "green";
      }
      if (index === result.wrongBeat) {
        return "red";
      }
      return "gray";
    }, false);

    const className = classNames({
      "beat-container": true,
      thin: !this.props.settings.labelBeats
    });

    return <div className={className}>
      <div className="expectedBeatBar">{expectedBeats}</div>
      <div className="actualBeatBar">{actualBeats}</div>
    </div>;
  }
}
