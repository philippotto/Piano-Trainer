import React, {Component} from "react";
import classNames from "classnames";
import _ from "lodash";

import StatisticsView from "../views/statistics_view.js";
import PitchSettingsView from "../views/pitch_settings_view.js";
import MidiService from "../services/midi_service.js";
import BarGenerator from "../services/bar_generator.js";
import StaveRenderer from "./stave_renderer.js";

const successMp3Url = require("file!../../resources/success.mp3");

export default class PitchReadingView extends Component {

  propTypes: {
    statisticService: React.PropTypes.object.isRequired,
    settings: React.PropTypes.object.isRequired,
  }

  componentDidMount() {
    this.midiService = new MidiService({
      successCallback: this.onSuccess.bind(this),
      failureCallback: this.onFailure.bind(this),
      errorCallback: this.onError.bind(this),
      errorResolveCallback: this.onErrorResolve.bind(this),
    });
    this.startDate = new Date();
    this.midiService.setDesiredKeys(this.getAllCurrentKeys(), this.state.currentKeySignature);

    const debugMode = true;
    if (debugMode) {
      this.debugKeyUpCallback = (event) => {
        const trueKeyCode = 84;
        const falseKeyCode = 70;
        if (event.keyCode === trueKeyCode) {
          this.onSuccess();
        } else if (event.keyCode === falseKeyCode) {
          this.onFailure();
        }
      };
      document.addEventListener("keyup", this.debugKeyUpCallback);
    }
  }

  componentWillUnmount() {
    document.removeEventListener("keyup", this.debugKeyUpCallback);
  }

  componentWillReceiveProps(nextProps) {
    const nextSettings = nextProps.settings;
    const prevSettings = this.props.settings;

    if (nextSettings !== prevSettings) {
      const nextChordSizeRanges = nextSettings.chordSizeRanges;
      const chordSizeRanges = prevSettings.chordSizeRanges;

      let treble = this.state.currentKeys.treble;
      let bass = this.state.currentKeys.bass;
      let keySignature = this.state.currentKeySignature;

      let shouldRegenerateAll = prevSettings.useAccidentals !== nextSettings.useAccidentals;

      if (shouldRegenerateAll || nextChordSizeRanges.treble !== chordSizeRanges.treble) {
        treble = BarGenerator.generateBar("treble", nextSettings);
      }
      if (shouldRegenerateAll || nextChordSizeRanges.bass !== chordSizeRanges.bass) {
        bass = BarGenerator.generateBar("bass", nextSettings);
      }
      if (shouldRegenerateAll || !_.isEqual(prevSettings.keySignature, nextSettings.keySignature)) {
        keySignature = BarGenerator.generateKeySignature(nextSettings);
      }

      this.setState({
        currentChordIndex: 0,
        currentKeys: {treble, bass},
        currentKeySignature: keySignature,
      });
    }
  }

  generateNewBarState() {
    return {
      currentChordIndex: 0,
      currentKeys: BarGenerator.generateBars(this.props.settings),
      currentKeySignature: BarGenerator.generateKeySignature(this.props.settings)
    };
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      errorMessage: null,
      ...(this.generateNewBarState())
    };
  }

  render() {
    const messageContainerStyle = classNames({
      "content-box": true,
      "message-container": true,
      hide: this.state.errorMessage === null
    });

    return (
      <div className="trainer">
        <div className="row center-lg center-md center-sm center-xs">
          <div className="col-lg col-md col-sm col-xs leftColumn">
            <div>
              <div className="game-container content-box">
                <StaveRenderer
                  keys={this.state.currentKeys}
                  chordIndex={this.state.currentChordIndex}
                  keySignature={this.state.currentKeySignature}
                />
              </div>
              <div className={messageContainerStyle}>
                <div className="message">
                  <h3 id="error-message">{this.state.errorMessage}</h3>
                  <h4>
                    {"Have a look into the "}
                    <a href="https://github.com/philippotto/Piano-Trainer#how-to-use">
                      Set Up
                    </a>
                    {" section."}
                  </h4>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-12 col-sm-12 col-xs-12 rightColumn">
            <PitchSettingsView settings={this.props.settings} />
            <StatisticsView statisticService={this.props.statisticService} />
          </div>
          <audio ref="successPlayer" hidden="true" src={successMp3Url} controls preload="auto" autobuffer />
        </div>
      </div>
    );
  }

  componentDidUpdate() {
    this.startDate = new Date();
    this.midiService.setDesiredKeys(this.getAllCurrentKeys(), this.state.currentKeySignature);
  }


  onError(msg) {
    console.error.apply(console, arguments);
    this.setState({errorMessage: msg});
  }


  onErrorResolve() {
    this.setState({errorMessage: null});
  }


  getAllCurrentKeys() {
    return _.flatten(["treble", "bass"].map((clef) =>
      this.state.currentKeys[clef][this.state.currentChordIndex].getKeys()
    ));
  }


  onSuccess() {
    const event = {
      success: true,
      keys: this.getAllCurrentKeys(),
      keySignature: this.state.currentKeySignature,
      time: new Date() - this.startDate,
    };

    const timeThreshold = 30000;

    if (event.time <= timeThreshold) {
      this.props.statisticService.register(event);
      this.onErrorResolve();
    } else {
      this.onError("Since you took more than " + timeThreshold / 1000 +
        ` seconds, we ignored this event to avoid dragging down your statistics.
         Hopefully, you just made a break in between :)`
      );
    }

    if (this.state.currentChordIndex + 1 >= this.state.currentKeys.treble.length) {
      this.setState({
        errorMessage: null,
        ...(this.generateNewBarState())
      });
    } else {
      this.setState({
        currentChordIndex: this.state.currentChordIndex + 1,
      });
    }

    this.playSuccessSound();
  }


  playSuccessSound() {
    this.refs.successPlayer.play();
  }


  onFailure() {
    this.props.statisticService.register({
      success: false,
      keys: this.getAllCurrentKeys(),
      time: new Date() - this.startDate,
      keySignature: this.state.currentKeySignature,
    });
  }


}
