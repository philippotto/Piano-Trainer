import Vex from "vexflow";
import React, {Component} from "react";
import StatisticsView from "../views/statistics_view.js";
import SettingsView from "../views/settings_view.js";
import MidiService from "../services/midi_service.js";
import KeyConverter from "../services/key_converter.js";
import classNames from "classnames";
import _ from "lodash";

const successMp3Url = require("file!../../resources/success.mp3");

export default class MainView extends Component {

  propTypes: {
    statisticService: React.PropTypes.object.isRequired
  }

  componentDidMount() {
    this.keyConverter = new KeyConverter();

    this.midiService = new MidiService(
      this.onSuccess.bind(this),
      this.onFailure.bind(this),
      this.onError.bind(this),
      this.onErrorResolve.bind(this)
    );
    this.initializeRenderer();
    this.renderStave();
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      errorMessage: null
    };
  }

  render() {
    const messageContainerStyle = classNames({
      Aligner: true,
      hide: this.state.errorMessage === null
    });

    return (
      <div>
        <img id="image-background" src="images/piano-background.jpg" />

        <div className="jumbotron">
          <h1>Piano Trainer</h1>
          <a href="https://github.com/philippotto/Piano-Trainer">
            <img id="github" src="images/github.png" />
          </a>
        </div>

        <div className="too-small">
          <div className="message">
            <p>
              {`
                This page is meant to be viewed on a sufficiently large screen
                with a MIDI enabled device connected.
              `}
              {"If you are interested to learn more about Piano-Trainer, view"}
              <a href="http://github.com/philippotto/Piano-Trainer">this page.</a>
            </p>
          </div>
        </div>

        <div className="trainer">
          <div className="Aligner">
            <div className="Aligner-item">
              <canvas ref="canvas"></canvas>
            </div>
          </div>

          <div id="message-container" className={messageContainerStyle}>
            <div className="Aligner-item message Aligner">
              <div>
                <h3 id="error-message"></h3>
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
          <div ref="stats">
            <SettingsView />
            <StatisticsView statisticService={this.props.statisticService} />
          </div>
          <audio id="success-player" hidden="true" src={successMp3Url} controls preload="auto" autobuffer></audio>
        </div>
      </div>
    );
  }

//   ui() {
//     return {
//       "canvas": "canvas",
//       "statistics": "#statistics",
//       "errorMessage": "#error-message",
//       "messageContainer": "#message-container"
//     };
//   }

  onError(msg) {
    console.error.apply(console, arguments);
    this.setState({errorMessage: msg});
  }


  onErrorResolve() {
    this.setState({errorMessage: null});
  }


  getAllCurrentKeys() {
    return _.flatten(["treble", "bass"].map((clef) =>
      this.currentNotes[clef][this.currentChordIndex].getKeys()
    ));
  }


  onSuccess() {
    const event = {
      success: true,
      keys: this.getAllCurrentKeys(),
      time: new Date() - this.startDate
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

    this.currentChordIndex++;
    this.renderStave();
    this.playSuccessSound();
  }


  playSuccessSound() {
    document.getElementById("success-player").play();
  }


  onFailure() {
    this.props.statisticService.register({
      success: false,
      keys: this.getAllCurrentKeys(),
      time: new Date() - this.startDate
    });
  }


  initializeRenderer() {
    this.renderer = new Vex.Flow.Renderer(this.refs.canvas, Vex.Flow.Renderer.Backends.CANVAS);
    this.ctx = this.renderer.getContext();
  }


  setCanvasExtent(width, height) {
    const canvas = this.refs.canvas;
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width;
    canvas.style.height = height;
  }


  renderStave() {
    this.startDate = new Date();

    const [width, height] = [500, 250];
    const ctx = this.ctx;

    ctx.clear();

    this.setCanvasExtent(width, height);

    const rightHandStave = new Vex.Flow.Stave(10, 0, width);
    rightHandStave.addClef("treble").setContext(ctx).draw();

    const leftHandStave = new Vex.Flow.Stave(10, 80, width);
    leftHandStave.addClef("bass").setContext(ctx).draw();

    if (!this.currentNotes || this.currentChordIndex >= this.currentNotes.treble.length) {
      this.currentNotes =
        {treble: this.generateBar("treble"),
        bass: this.generateBar("bass")
        };
    }

    this.colorizeKeys();

    [[rightHandStave, "treble"], [leftHandStave, "bass"]].map(([stave, clef]) => {
      Vex.Flow.Formatter.FormatAndDraw(ctx, stave, this.currentNotes[clef]);
    });

    this.midiService.setDesiredKeys(this.getAllCurrentKeys());
  }


  colorizeKeys() {
    Object.keys(this.currentNotes).map((key) => {
      const clef = this.currentNotes[key];
      clef.forEach((staveNote, index) => {
        const color = index < this.currentChordIndex ? "green" : "black";
        _.range(staveNote.getKeys().length).map((noteIndex) => {
          staveNote.setKeyStyle(noteIndex, {fillStyle: color});
        });
      });
    }
    );
  }


  getBaseNotes() {
    return "cdefgab".split("");
  }


  generateBar(clef) {
    const options = {
      notesPerBar: 4,
      maximumKeysPerChord: 3,
      withModifiers: false,
      levels: {
        bass: [2, 3],
        treble: [4, 5]
      },
      maximumInterval: 12
    };

    this.currentChordIndex = 0;
    const baseModifiers = options.withModifiers ? ["", "b", "#"] : [""];
    const generatedChords = _.range(0, options.notesPerBar).map(() => {
      const randomLevel = _.sample(options.levels[clef]);

      const generateNote = function (baseNotes) {
        const randomNoteIndex = _.random(0, baseNotes.length - 1);
        const note = baseNotes.splice(randomNoteIndex, 1)[0];

        const modifier = _.sample(baseModifiers);
        return {note, modifier};
      };

      const generateChord = () => {
        const baseNotes = this.getBaseNotes();
        return _.times(_.random(1, options.maximumKeysPerChord), () => {
          return generateNote(baseNotes);
        });
      };

      const formatKey = ({note, modifier}) => note + modifier + "/" + randomLevel;

      const ensureInterval = (keys) => {
        const keyNumbers = keys.map((key) => {
          return this.keyConverter.getNumberForKeyString(formatKey(key));
        });
        return options.maximumInterval >= _.max(keyNumbers) - _.min(keyNumbers);
      };

      let randomChord = generateChord();
      while (!ensureInterval(randomChord)) {
        randomChord = generateChord();
      }

      const staveChord = new Vex.Flow.StaveNote({
        clef: clef,
        keys: randomChord.map(formatKey).sort((keyA, keyB) => {
          return this.keyConverter.getNumberForKeyString(keyA) -
            this.keyConverter.getNumberForKeyString(keyB);
        }),
        duration: `${options.notesPerBar}`
      });

      randomChord.forEach(({note, modifier}, index) => {
        if (modifier) {
          staveChord.addAccidental(index, new Vex.Flow.Accidental(modifier));
        }

        return staveChord;
      });

      return staveChord;
    });

    return generatedChords;
  }
}
