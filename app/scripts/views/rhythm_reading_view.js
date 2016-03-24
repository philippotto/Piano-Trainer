import React, {Component} from "react";
import classNames from "classnames";
import _ from "lodash";

import BarGenerator from "../services/bar_generator.js";
import RhythmChecker from "../services/rhythm_checker.js";
import StaveRenderer from "./stave_renderer.js";

const successMp3Url = require("file!../../resources/success.mp3");

export default class PitchReadingView extends Component {

  propTypes: {
    settings: React.PropTypes.object.isRequired,
  }

  generateNewBarState() {
    return {
      currentRhythm: BarGenerator.generateRhythmBar(this.props.settings),
    };
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      errorMessage: null,
      successMessage: null,
      ...(this.generateNewBarState()),
      running: false,
    };
    this.beatRegistry = [];
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.running && !prevState.running) {
      this.playMetronome();

    } else {
      console.log("not running");
    }
  }

  playMetronome() {
    const beatLength = this.props.settings.barDuration / 4;
    const startDate = performance.now();
    console.log("startDate",  startDate);

    _.range(9).map((beatIndex) => {
      if (beatIndex === 4)  {
        // this is the first beat of the actual bar
        this.firstBarBeatTime = startDate + beatIndex * beatLength;
      }
      const timeout = startDate + beatIndex * beatLength - performance.now();
      console.log("timeout",  timeout);
      setTimeout(
        () => {
          if (beatIndex < 8) {
            console.log("playSound", performance.now());
            this.playSuccessSound();
          } else {
            // check durations
            const durations = this.state.currentRhythm.durations;
            console.log("durations", durations);
            console.log("this.beatRegistry",  this.beatRegistry);
            const expectedTimes = RhythmChecker.convertDurationsToTimes(
              durations,
              this.props.settings.barDuration
            );

            const correct = RhythmChecker.compare(expectedTimes, this.beatRegistry);

            console.log("rhythm correct", correct);


            // stop and render new bar
            this.setState({
              running: false,
              successMessage: correct ? "Yay! You nailed the rhythm!" : "Oh no, you didn't play the rhythm correctly"
              // ...(this.generateNewBarState())
            });
          }
        },
        timeout
      )
    });
  }

  visualizeBeatRegistry() {
    console.log("visualizeBeatRegistry");
    console.log("beatRegistry",  this.beatRegistry);
    const drawingContext = document.getElementById("canvas").getContext("2d");
    const offset = 50;
    const quarterWidth = 120;
    const conversionFactor = 1000 / this.props.settings.barDuration * quarterWidth / 250;
    this.beatRegistry.forEach((beat) => {
      const a = beat[0] * conversionFactor;
      const b = beat[1] * conversionFactor;
      drawingContext.fillRect(offset + a, 150, b - a, 10);
    });
  }

  componentDidMount() {
    let lastSpaceEvent = "keyup";
    const keyHandler = (eventType, event) => {
      const spaceCode = 32;
      if (event.keyCode !== spaceCode) {
        return;
      }
      if (this.state.running) {
        // ignore consecutive events of the same type
        if (lastSpaceEvent === eventType) {
          return;
        }
        lastSpaceEvent = eventType;


        // protocol beat
        const newBeatTime = performance.now() - this.firstBarBeatTime;
        if (eventType === "keyup") {
          this.beatRegistry.slice(-1)[0].push(newBeatTime);
        } else {
          this.beatRegistry.push([newBeatTime]);
        }
        this.visualizeBeatRegistry();
      } else {
        if (eventType === "keyup") {
          this.beatRegistry = [];
          this.setState({
            running: true,
          });
        }
      }
    }

    ['keydown', 'keyup'].forEach((eventType) => {
      document.addEventListener(eventType, keyHandler.bind(null, eventType));
    });
  }

  render() {
    const messageContainerStyle = classNames({
      Aligner: true,
      hide: this.state.errorMessage === null
    });

    return (
      <div className="trainer">
        <div className="Aligner">
          <div className="Aligner-item">
            <StaveRenderer
              keys={this.state.currentRhythm.keys}
              chordIndex={this.state.currentChordIndex}
              keySignature={"C"}
              afterRender={this.visualizeBeatRegistry.bind(this)}
            />
            <h3>
              {this.state.running ? null : this.state.successMessage}
            </h3>
          </div>
        </div>

        <div id="message-container" className={messageContainerStyle}>
          <div className="Aligner-item message Aligner">
            <h3 id="error-message"></h3>
          </div>
        </div>
        <audio ref="successPlayer" hidden="true" src={successMp3Url} controls preload="auto" autobuffer />
      </div>
    );
  }

  playSuccessSound() {
    this.refs.successPlayer.play();
  }

}
