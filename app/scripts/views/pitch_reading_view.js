import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import _ from "lodash";

import PitchStatisticView from "../views/pitch_statistic_view.js";
import PitchSettingsView from "../views/pitch_settings_view.js";
import AnalyticsService from "../services/analytics_service.js";
import MidiService from "../services/midi_service.js";
import BarGenerator from "../services/bar_generator.js";
import LevelService from "../services/level_service.js";
import StaveRenderer from "./stave_renderer.js";
import ClaviatureView from "./claviature_view";
import GameButton from "./game_button.js";
import CollapsableContainer from "./collapsable_container.js";

const successMp3Url = require("file!../../resources/success.mp3");

export default class PitchReadingView extends Component {
  static propTypes = {
    statisticService: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired,
    isActive: PropTypes.bool.isRequired,
  };

  static childContextTypes = {
    isInActiveView: PropTypes.bool,
  };

  getChildContext() {
    return {
      isInActiveView: this.props.isActive,
    };
  }

  componentDidMount() {
    this.midiService = new MidiService({
      successCallback: this.onSuccess.bind(this),
      failureCallback: this.onFailure.bind(this),
      errorCallback: this.onMidiError.bind(this),
      errorResolveCallback: this.onMidiErrorResolve.bind(this),
    });
    this.startDate = new Date();
    this.midiService.setDesiredKeys(this.getAllCurrentKeys(), this.state.currentKeySignature);

    const debugMode = true;
    if (debugMode) {
      this.debugKeyUpCallback = event => {
        const yesKeyCode = 89;
        const noKeyCode = 78;
        if (event.keyCode === yesKeyCode) {
          this.onSuccess();
        } else if (event.keyCode === noKeyCode) {
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
    function checkIfSomePropChanged(oldObj, newObj, keys) {
      return keys.some(key => _.at(oldObj, key) !== _.at(newObj, key));
    }

    const nextSettings = nextProps.settings;
    const prevSettings = this.props.settings;

    if (nextSettings !== prevSettings) {
      const nextChordSizeRanges = nextSettings.chordSizeRanges;
      const chordSizeRanges = prevSettings.chordSizeRanges;
      const nextNoteRange = nextSettings.noteRange;
      const noteRange = prevSettings.noteRange;

      let newCurrentKeys = this.state.currentKeys;
      let keySignature = this.state.currentKeySignature;

      let shouldRegenerateAll = checkIfSomePropChanged(prevSettings, nextSettings, [
        "useAccidentals",
        "useAutomaticDifficulty",
        "automaticDifficulty.newNotesShare",
      ]);

      if (
        shouldRegenerateAll ||
        nextChordSizeRanges.treble !== chordSizeRanges.treble ||
        nextChordSizeRanges.bass !== chordSizeRanges.bass ||
        !_.isEqual(prevSettings.keySignature, nextSettings.keySignature) ||
        nextNoteRange !== noteRange
      ) {
        keySignature = BarGenerator.generateKeySignature(nextSettings);
        newCurrentKeys = this.generateNewBars(nextSettings, keySignature);
      }

      this.setState({
        currentChordIndex: 0,
        currentKeys: newCurrentKeys,
        currentKeySignature: keySignature,
      });
      this.startDate = new Date();
    }
  }

  generateNewBars(settings, keySignature) {
    const levelIndex = LevelService.getLevelOfUser(this.props.statisticService.getAllEvents()) + 1;
    const level = LevelService.getLevelByIndex(levelIndex);

    const { isMidiAvailable } = this.getMidiInfo();
    const onePerTime = !isMidiAvailable;

    return BarGenerator.generateBars(
      settings,
      keySignature,
      settings.useAutomaticDifficulty ? level : null,
      onePerTime,
    );
  }

  generateNewBarState() {
    const keySignature = BarGenerator.generateKeySignature(this.props.settings);
    return {
      currentChordIndex: 0,
      currentKeySignature: keySignature,
      currentKeys: this.generateNewBars(this.props.settings, keySignature),
    };
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      midiErrorMessage: null,
      running: false,
      ...this.generateNewBarState(),
    };
  }

  startStopTraining() {
    AnalyticsService.sendEvent("PitchReading", this.state.running ? "Stop" : "Start");
    this.setState({ running: !this.state.running });
    this.startDate = new Date();
  }

  getMidiInfo() {
    const tryToUseMidi = this.props.settings.tryToUseMidi;
    const isMidiAvailable = this.props.settings.midi.inputs.get().length > 0;
    const useMidi = tryToUseMidi && isMidiAvailable;
    const noMidiErrors = !this.state ? true : this.state.midiErrorMessage == null;

    return {
      tryToUseMidi,
      isMidiAvailable,
      useMidi,
      noMidiErrors,
    };
  }

  render() {
    const claviatureContainerClasses = classNames({
      "content-box": true,
      "claviature-container": true,
    });

    const { tryToUseMidi, isMidiAvailable, useMidi, noMidiErrors } = this.getMidiInfo();

    const miniClaviature =
      useMidi && noMidiErrors ? null : (
        <ClaviatureView
          desiredKeys={this.getAllCurrentKeys()}
          keySignature={this.state.currentKeySignature}
          successCallback={this.onSuccess.bind(this)}
          failureCallback={this.onFailure.bind(this)}
          disabled={!this.state.running}
        />
      );

    const startStopButton = (
      <GameButton
        label={`${this.state.running ? "Stop" : "Start"} training`}
        shortcutLetter="s"
        primary
        onClick={this.startStopTraining.bind(this)}
      />
    );

    const midiSetUpText = (
      <p>
        {`The generated notes will be so that you play only one note at a time.
      If you want to practice chords, have a look into the `}
        <a href="https://github.com/philippotto/Piano-Trainer#how-to-use">Set Up</a>
        {" section to hook up your digital piano."}
      </p>
    );

    const welcomeText = (
      <CollapsableContainer collapsed={this.state.running}>
        <div
          className={classNames({
            welcomeText: true,
          })}
        >
          <h3>Welcome to pitch training!</h3>
          <p>
            {"When you hit Start, notes will be displayed in the stave above. "}
            {useMidi
              ? "Since we found a connected piano, you can use it to play the notes. "
              : "Just use the mini claviature below to play the notes. "}
            {"Don't worry about the rhythm or speed for now."}
          </p>
          {tryToUseMidi && !isMidiAvailable ? midiSetUpText : null}
        </div>
      </CollapsableContainer>
    );

    const emptyKeySet = {
      treble: [],
      bass: [],
    };

    const hideMidiError = !tryToUseMidi || noMidiErrors;

    return (
      <div className={classNames({ trainer: true, trainerHidden1: !this.props.isActive })}>
        <div className="row center-lg center-md center-sm center-xs">
          <div className="col-lg col-md col-sm col-xs leftColumn">
            <div>
              <div className="game-container content-box">
                <StaveRenderer
                  keys={this.state.running ? this.state.currentKeys : emptyKeySet}
                  chordIndex={this.state.currentChordIndex}
                  keySignature={this.state.currentKeySignature}
                />

                <div
                  className={classNames({
                    "row center-xs": true,
                  })}
                >
                  <div className="col-xs-12">
                    {welcomeText}
                    {startStopButton}
                  </div>
                </div>
              </div>
              <CollapsableContainer collapsed={!miniClaviature && hideMidiError}>
                <div className={claviatureContainerClasses}>
                  {miniClaviature}
                  <div
                    className={classNames({
                      message: true,
                      hide: hideMidiError,
                    })}
                  >
                    <h3>{this.state.midiErrorMessage}</h3>
                  </div>
                </div>
              </CollapsableContainer>
            </div>
          </div>
          <div className="col-lg-4 col-md-12 col-sm-12 col-xs-12 rightColumn">
            <PitchSettingsView settings={this.props.settings} />
            <PitchStatisticView
              statisticService={this.props.statisticService}
              settings={this.props.settings}
            />
          </div>
          <audio
            ref={c => {
              this.successPlayer = c;
            }}
            hidden="true"
            src={successMp3Url}
            controls
            preload="auto"
          />
        </div>
      </div>
    );
  }

  componentDidUpdate() {
    this.midiService.setDesiredKeys(this.getAllCurrentKeys(), this.state.currentKeySignature);
  }

  onMidiError(msg) {
    console.error.apply(console, arguments);
    this.setState({ midiErrorMessage: msg });
  }

  onMidiErrorResolve() {
    this.setState({ midiErrorMessage: null });
  }

  getAllCurrentKeys() {
    return _.compact(
      _.flatten(
        ["treble", "bass"].map(clef => {
          const note = this.state.currentKeys[clef][this.state.currentChordIndex];
          // Ignore rests
          return note.noteType !== "r" ? note.getKeys() : null;
        }),
      ),
    );
  }

  onSuccess() {
    if (!this.state.running) {
      return;
    }
    const event = {
      success: true,
      keys: this.getAllCurrentKeys(),
      keySignature: this.state.currentKeySignature,
      time: new Date() - this.startDate,
    };
    this.startDate = new Date();

    this.props.statisticService.register(event);

    if (this.state.currentChordIndex + 1 >= this.state.currentKeys.treble.length) {
      this.setState({
        ...this.generateNewBarState(),
      });
    } else {
      this.setState({
        currentChordIndex: this.state.currentChordIndex + 1,
      });
    }

    this.playSuccessSound();
    AnalyticsService.sendEvent("PitchReading", "success");
  }

  playSuccessSound() {
    this.successPlayer.play();
  }

  onFailure() {
    if (!this.state.running) {
      return;
    }

    this.props.statisticService.register({
      success: false,
      keys: this.getAllCurrentKeys(),
      time: new Date() - this.startDate,
      keySignature: this.state.currentKeySignature,
    });
    AnalyticsService.sendEvent("PitchReading", "failure");
  }
}
