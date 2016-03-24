import React, {Component} from "react";
import classNames from "classnames";
import _ from "lodash";

import BarGenerator from "../services/bar_generator.js";
import RhythmChecker from "../services/rhythm_checker.js";
import StaveRenderer from "./stave_renderer.js";

const successMp3Url = require("file!../../resources/success.mp3");

const feedbackCanvasWidth = 500;

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
    this.beatHistory = [];
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
            const expectedTimes = this.getExpectedTimes();
            const correct = RhythmChecker.compare(expectedTimes, this.beatHistory);

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

  visualizeBeatHistory() {
    const canvas = this.refs.feedbackCanvas;
    const context = canvas.getContext("2d");
    if (this.beatHistory.length === 0) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    console.log("visualizeBeatHistory");
    console.log("beatHistory",  this.beatHistory);
    const offset = 0;
    const conversionFactor = 1000 / this.props.settings.barDuration * (feedbackCanvasWidth / 1000);

    const drawBar = (x, y, width, color) => {
      const barHeight = 10;
      const radius = barHeight / 2;

      context.fillStyle = color;
      context.fillRect(x + radius, y, width - 2 * radius, barHeight);

      context.beginPath();
      context.arc(x + radius, y + radius, radius, 0, 2 * Math.PI, false);
      context.fill();

      context.beginPath();
      // The bar will be drawn one pixel too short, so that there is a margin
      // between adjacent bars
      context.arc(x + width - radius - 1, y + radius, radius, 0, 2 * Math.PI, false);
      context.fill();

    };

    const drawBeats = (beats, y, color) => {
      beats.forEach((beat) => {
        const a = beat[0] * conversionFactor;
        const b = beat[1] * conversionFactor;
        const x = offset + a;
        const width = b - a;
        drawBar(x, y, width, color);
      });

    }
    drawBeats(this.getExpectedTimes(), 0, "gray");
    drawBeats(this.beatHistory, 20, "green");

  }

  getExpectedTimes() {
    const durations = this.state.currentRhythm.durations;
    console.log("durations", durations);
    console.log("this.beatHistory",  this.beatHistory);
    return RhythmChecker.convertDurationsToTimes(
      this.state.currentRhythm.durations,
      this.props.settings.barDuration
    );
  }

  componentDidMount() {
    const keyup = "keyup";
    const keydown = "keydown";

    let lastSpaceEvent = keyup;
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
        // protocol beat
        const newBeatTime = performance.now() - this.firstBarBeatTime;
        if (newBeatTime < 0) {
          return;
        }

        lastSpaceEvent = eventType;

        if (eventType === keydown) {
          this.beatHistory.push([newBeatTime]);
        } else {
          if (this.beatHistory.length === 0) {
            // Keydown event was not registered. Assume it was pressed on
            // firstBarBeatTime.
            this.beatHistory.push([this.firstBarBeatTime]);
          }
          this.beatHistory.slice(-1)[0].push(newBeatTime);
        }
      } else {
        if (eventType === keyup) {
          this.beatHistory = [];
          this.setState({
            running: true,
          });
        }
      }
    }

    [keydown, keyup].forEach((eventType) => {
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
              afterRender={this.visualizeBeatHistory.bind(this)}
              staveCount={1}
            />

            <canvas
              ref="feedbackCanvas"
              width={feedbackCanvasWidth}
              height={50}
              style={{marginLeft: 10}}/>

            <h3 style={{textAlign: "center"}}>
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
