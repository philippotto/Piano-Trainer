import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import BarGenerator from "../services/bar_generator.js";
import RhythmChecker from "../services/rhythm_checker.js";
import AnalyticsService from "../services/analytics_service.js";

import StaveRenderer from "./stave_renderer.js";
import GameButton from "./game_button.js";
import RhythmSettingsView from "./rhythm_settings_view.js";
import RhythmStatisticView from "./rhythm_statistic_view.js";
import BeatVisualization from "./beat_visualization.js";
import CollapsableContainer from "./collapsable_container.js";
import MetronomeView from "./metronome_view.js";

const keyup = "keyup";
const keydown = "keydown";

const Phases = {
  welcome: "welcome",
  running: "running",
  feedback: "feedback"
};

export default class RhythmReadingView extends Component {
  static propTypes = {
    settings: PropTypes.object.isRequired,
    statisticService: PropTypes.object.isRequired,
    isActive: PropTypes.bool.isRequired
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      errorMessage: null,
      result: null,
      currentRhythm: BarGenerator.generateEmptyRhythmBar(),
      phase: Phases.welcome
    };
    this.beatHistory = [];
    this.keyHandlers = {};
  }

  static childContextTypes = {
    isInActiveView: PropTypes.bool
  };

  getChildContext() {
    return {
      isInActiveView: this.props.isActive
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.phase === Phases.running && prevState.phase !== Phases.running) {
      this.metronome.playMetronome();
    } else {
      console.log("not running");
    }
  }

  onMetronomeEnded() {
    const settings = this.props.settings;
    const barDuration = settings.barDuration;
    const expectedTimes = RhythmChecker.convertDurationsToTimes(this.state.currentRhythm.durations, barDuration);
    this.fixBeatHistory();

    const result = RhythmChecker.compare(expectedTimes, this.beatHistory, settings);

    this.props.statisticService.register({
      success: result.success,
      durations: this.state.currentRhythm.durations,
      barDuration,
      liveBeatBars: settings.liveBeatBars,
      labelBeats: settings.labelBeats
    });

    this.setState({
      phase: Phases.feedback,
      result: result
    });

    AnalyticsService.sendEvent("RhythmReading-Result", result.success);
  }

  fixBeatHistory() {
    if (this.beatHistory.length === 0) {
      return;
    }
    // If the user pressed the very first beat it a bit too early,
    // we will round the time up to zero
    const firstBeat = this.beatHistory[0];
    if (firstBeat[0] < 0) {
      firstBeat[0] = 0;
    }

    // If the user doesn't release the key at the end of the bar,
    // we will add the up event to the beatHistory
    const lastBeat = this.beatHistory.slice(-1)[0];
    if (lastBeat.length === 1) {
      const firstBarBeatTime = this.metronome.getFirstBarBeatTime();
      lastBeat.push(performance.now() - firstBarBeatTime);
    }
  }

  componentDidMount() {
    let lastSpaceEvent = keyup;
    const keyHandler = (eventType, event) => {
      const spaceCode = 32;
      AnalyticsService.sendEvent("RhythmReading", "keyPress", event.keyCode);

      if (event.keyCode !== spaceCode && event.type.indexOf("touch") === -1) {
        return;
      }
      if (event.keyCode === spaceCode) {
        // Always prevent scrolling by space-button (avoids annoying scrolling
        // when the user keeps pressing the space button into the feedback
        // phase.
        event.preventDefault();
      }
      if (this.state.phase === Phases.running) {
        // ignore consecutive events of the same type
        if (lastSpaceEvent === eventType) {
          return;
        }
        // protocol beat
        const firstBarBeatTime = this.metronome.getFirstBarBeatTime();
        const newBeatTime = performance.now() - firstBarBeatTime;
        lastSpaceEvent = eventType;

        if (eventType === keydown) {
          this.beatHistory.push([newBeatTime]);
        } else {
          if (newBeatTime < 0) {
            // If the user hit the key and lifted it before the first beat
            // (which is way too early), we'll ignore it.
            this.beatHistory = [];
            return;
          }
          if (this.beatHistory.length === 0) {
            // Keydown event was not registered. Assume it was pressed on
            // firstBarBeatTime.
            this.beatHistory.push([firstBarBeatTime]);
          }
          this.beatHistory.slice(-1)[0].push(newBeatTime);
        }
      } else if (lastSpaceEvent === keydown && eventType === keyup) {
        lastSpaceEvent = keyup;
        return;
      }
    };

    [keydown, keyup].forEach(eventType => {
      this.keyHandlers[eventType] = keyHandler.bind(null, eventType);
      document.addEventListener(eventType, this.keyHandlers[eventType]);
      document.addEventListener(eventType === keydown ? "touchstart" : "touchend", this.keyHandlers[eventType]);
    });

    this.keyHandlers.contextmenu = event => {
      if (this.state.phase === Phases.running) {
        // Circumvent long taps triggering a context menu.
        event.preventDefault();
      }
    };

    document.addEventListener("contextmenu", this.keyHandlers.contextmenu);
  }

  componentWillUnmount() {
    [keydown, keyup].forEach(eventType => {
      document.removeEventListener(eventType, this.keyHandlers[eventType]);
      document.removeEventListener(eventType === keydown ? "touchstart" : "touchend", this.keyHandlers[eventType]);
    });
    document.removeEventListener("contextmenu", this.keyHandlers.contextmenu);
  }

  repeatBar() {
    if (this.state.phase === Phases.running) {
      return;
    }
    AnalyticsService.sendEvent("RhythmReading", "repeatBar");
    this.beatHistory = [];
    this.setState({
      phase: Phases.running,
      result: null
    });
  }

  nextBar() {
    if (this.state.phase === Phases.running) {
      return;
    }
    AnalyticsService.sendEvent("RhythmReading", "nextBar");
    this.beatHistory = [];
    const newRhythm = BarGenerator.generateRhythmBar(this.props.settings);

    this.setState({
      phase: Phases.running,
      result: null,
      currentRhythm: newRhythm
    });
  }

  render() {
    const welcomeText = (
      <CollapsableContainer collapsed={this.state.phase !== Phases.welcome}>
        <h3>Welcome to this rhythm training!</h3>
        <p>
          When you start the training, we will count in for 4 beats and afterwards you can tap the given rhythm (either
          use your &lsquo;space&rsquo; button or your touchscreen). Make sure your speakers are on so that you can hear
          the metronome.
        </p>
      </CollapsableContainer>
    );

    const feedbackSection = (
      <CollapsableContainer collapsed={this.state.phase !== Phases.feedback}>
        <h2>
          {this.state.result && this.state.result.success
            ? "Yay! You nailed the rhythm!"
            : "Oh no, you didn't get the rhythm right :("}
        </h2>
        <h4 style={{ marginTop: 0 }}>Have a look at your performance:</h4>
      </CollapsableContainer>
    );

    const beatBarSection = (
      <CollapsableContainer
        freeze={true}
        collapsed={
          !(
            this.state.phase === Phases.feedback ||
            (this.state.phase === Phases.running && this.props.settings.liveBeatBars)
          )
        }
      >
        <BeatVisualization
          currentRhythm={this.state.currentRhythm}
          settings={this.props.settings}
          barDuration={
            this.state.phase === Phases.feedback
              ? this.props.statisticService.getLastBarDuration()
              : this.props.settings.barDuration
          }
          beatHistory={this.beatHistory}
          result={this.state.result}
        />
      </CollapsableContainer>
    );

    console.log(this.state.currentRhythm.keys);

    const metronomeBeat = (
      <MetronomeView
        settings={this.props.settings}
        ref={c => {
          this.metronome = c;
        }}
        onMetronomeEnded={this.onMetronomeEnded.bind(this)}
      />
    );

    const buttons =
      this.state.phase !== Phases.feedback
        ? <GameButton label="Start training" shortcutLetter="s" primary onClick={this.nextBar.bind(this)} />
        : this.state.result.success
          ? <div>
              <GameButton label="Repeat this bar" shortcutLetter="r" onClick={this.repeatBar.bind(this)} />
              <GameButton label="Start next bar" shortcutLetter="s" onClick={this.nextBar.bind(this)} primary />
            </div>
          : <div>
              <GameButton label="Repeat this bar" shortcutLetter="r" onClick={this.repeatBar.bind(this)} primary />
              <GameButton label="Skip this bar" shortcutLetter="s" onClick={this.nextBar.bind(this)} />
            </div>;

    return (
      <div className={classNames({ trainer: true, trainerHidden2: !this.props.isActive })}>
        <div className="row center-lg center-md center-sm center-xs">
          <div className="col-lg col-md col-sm col-xs leftColumn">
            <div>
              <div className="game-container content-box transition">
                <StaveRenderer
                  keys={this.state.currentRhythm.keys}
                  chordIndex={this.state.currentChordIndex}
                  keySignature={"C"}
                  staveCount={1}
                />

                <div style={{ textAlign: "center" }}>
                  {metronomeBeat}
                  {welcomeText}
                  {feedbackSection}
                  {beatBarSection}
                </div>

                <CollapsableContainer collapsed={this.state.phase === Phases.running}>
                  <div className="row center-xs" style={{ marginTop: 20 }}>
                    <div className="col-xs-12">
                      {buttons}
                    </div>
                  </div>
                </CollapsableContainer>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-12 col-sm-12 col-xs-12 rightColumn">
            <RhythmSettingsView settings={this.props.settings} />
            <RhythmStatisticView statisticService={this.props.statisticService} />
          </div>
        </div>
      </div>
    );
  }
}
