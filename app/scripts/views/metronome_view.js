import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import _ from "lodash";

import MetronomeService from "../services/metronome_service.js";
import CollapsableContainer from "./collapsable_container.js";

export default class MetronomeView extends Component {
  static propTypes = {
    onMetronomeEnded: PropTypes.func,
    settings: PropTypes.object.isRequired,
    statisticService: PropTypes.object.isRequired
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      currentMetronomeBeat: -1
    };
  }

  getFirstBarBeatTime() {
    return this.firstBarBeatTime;
  }

  playMetronome() {
    const beatLength = this.props.settings.barDuration / 4;
    const delay = 100; // give the scheduler a bit of time to start the jam
    const now = performance.now();
    const startTime = now + delay;
    console.log("startTime", startTime);
    const beatAmount = 8;
    const metronomeSoundLength = 180; // ms
    // Not sure when exactly the metronome beat is anticipated by a human
    // E.g. exactly on the first millisecond? For now I'm assuming at 1/3 of
    // playing time.
    const magicPercentileOfAudibleBeat = 0.33;
    // this is the first beat of the actual bar
    this.firstBarBeatTime = startTime + 4 * beatLength + metronomeSoundLength * magicPercentileOfAudibleBeat;

    _.range(beatAmount + 1).map(beatIndex => {
      const beatTime = startTime + beatIndex * beatLength;
      const delay = beatTime - now;

      if (beatIndex < beatAmount) {
        MetronomeService.play(delay);
      }
      setTimeout(() => {
        this.setState({
          currentMetronomeBeat: beatIndex < 4 ? beatIndex : -1
        });

        if (beatIndex === beatAmount) {
          this.props.onMetronomeEnded();
        }
      }, delay);
    });
  }

  render() {
    return (
      <CollapsableContainer
        collapsed={this.state.currentMetronomeBeat === -1}
        className={classNames({
          opacityOut: (this.state.currentMetronomeBeat + 1) % 4 === 0
        })}
      >
        <h2>
          {this.state.currentMetronomeBeat + 1}
        </h2>
      </CollapsableContainer>
    );
  }
}
