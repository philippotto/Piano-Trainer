import Vex from 'vexflow';
import React, {Component} from 'react';
import StatisticsView from '../views/statistics_view.js';
import MidiService from '../services/midi_service.js';
import KeyConverter from '../services/key_converter.js';
import classNames from 'classnames';

const successMp3Url = require('file!../../resources/success.mp3');

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
    return this.renderStave();
  }

  constructor() {
    super();
    this.state = {
      errorMessage : null
    };
  }

  render() {
    const messageContainerStyle = classNames({
      "Aligner" : true,
      "hide" : this.state.errorMessage === null
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
              This page is meant to be viewed on a sufficiently large screen with a MIDI enabled device connected.
              If you are interested to learn more about Piano-Trainer, view <a href="http://github.com/philippotto/Piano-Trainer">this page.</a>
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
                  Have a look into the <a href="https://github.com/philippotto/Piano-Trainer#how-to-use">Set Up</a> section.
                </h4>
              </div>
            </div>
          </div>
          <StatisticsView statisticService={this.props.statisticService} />
          <audio id="success-player" hidden="true" src={successMp3Url} controls preload="auto" autobuffer></audio>
        </div>
      </div>
    );
  }

//   ui() {
//     return {
//       "canvas" : "canvas",
//       "statistics" : "#statistics",
//       "errorMessage" : "#error-message",
//       "messageContainer" : "#message-container"
//     };
//   }

  onError(msg, args) {
    console.error.apply(console, arguments);
    this.setState({errorMessage : msg});
  }


  onErrorResolve() {
    this.setState({errorMessage : null});
  }


  getAllCurrentKeys() {
    return [].concat(
      this.currentNotes["treble"][this.currentChordIndex].getKeys(),
      this.currentNotes["bass"][this.currentChordIndex].getKeys()
    );
  }


  onSuccess() {
    var event = {
      success : true,
      keys : this.getAllCurrentKeys(),
      time : new Date() - this.startDate
    };

    var timeThreshold = 30000;

    if (event.time <= timeThreshold) {
      this.props.statisticService.register(event);
      this.onErrorResolve();
    } else {
      // don't save events which took too long
      // we don't want to drag the statistics down when the user made a break
      this.onError("Since you took more than " + timeThreshold/1000 + " seconds, we ignored this event to avoid dragging down your statistics. Hopefully, you just made a break in between :)");
    }

    this.currentChordIndex++;
    this.renderStave();
    return this.playSuccessSound();
  }


  playSuccessSound() {
    return document.getElementById('success-player').play();
  }


  onFailure() {
    this.props.statisticService.register({
      success : false,
      keys : this.getAllCurrentKeys(),
      time : new Date() - this.startDate
    });
  }


  initializeRenderer() {
    this.renderer = new Vex.Flow.Renderer(this.refs.canvas, Vex.Flow.Renderer.Backends.CANVAS);
    return this.ctx = this.renderer.getContext();
  }


  setCanvasExtent(width, height) {
    var canvas = this.refs.canvas;
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width;
    return canvas.style.height = height;
  }


  renderStave() {
    this.startDate = new Date();

    var [width, height] = [500, 250];
    var [renderer, ctx] = [this.renderer, this.ctx];

    ctx.clear();

    this.setCanvasExtent(width, height);

    var rightHandStave = new Vex.Flow.Stave(10, 0, width);
    rightHandStave.addClef("treble").setContext(ctx).draw();

    var leftHandStave = new Vex.Flow.Stave(10, 80, width);
    leftHandStave.addClef("bass").setContext(ctx).draw();

    if (!this.currentNotes || this.currentChordIndex >= this.currentNotes.treble.length) {
      this.currentNotes =
        {treble : this.generateBar("treble"),
        bass : this.generateBar("bass")
        };
    }

    this.colorizeKeys();

    [[rightHandStave, "treble"], [leftHandStave, "bass"]].map(([stave, clef]) => {
      return Vex.Flow.Formatter.FormatAndDraw(ctx, stave, this.currentNotes[clef]);
    });

    return this.midiService.setDesiredKeys(this.getAllCurrentKeys());
  }


  colorizeKeys() {
    return Object.keys(this.currentNotes).map((key) => {
      var clef = this.currentNotes[key];
      return clef.forEach((staveNote, index) => {
        var color = index < this.currentChordIndex ? "green" : "black";
        return _.range(staveNote.getKeys().length).map((index) => {
          return staveNote.setKeyStyle(index, {fillStyle: color});
        });
      });
    }
    );
  }


  getBaseNotes() {
    return "cdefgab".split("");
  }


  generateBar(clef) {
    var options = {
      notesPerBar : 4,
      maximumKeysPerChord : 3,
      withModifiers : false,
      levels : {
        bass : [2, 3],
        treble : [4, 5]
      },
      maximumInterval : 12
    };

    this.currentChordIndex = 0;
    var baseModifiers = options.withModifiers ? ["", "b", "#"] : [""];
    var generatedChords = _.range(0, options.notesPerBar).map( () => {
      var randomLevel = _.sample(options.levels[clef]);

      var generateNote = function(baseNotes) {
        var randomNoteIndex = _.random(0, baseNotes.length - 1);
        var note = baseNotes.splice(randomNoteIndex, 1)[0];

        var modifier = _.sample(baseModifiers);
        return {note, modifier};
      };

      var generateChord = () => {
        var keys;
        var baseNotes = this.getBaseNotes();
        return keys = _.times(_.random(1, options.maximumKeysPerChord), () => {
          return generateNote(baseNotes);
        });
      };

      var formatKey = ({note, modifier}) => note + modifier + "/" + randomLevel;

      var ensureInterval = (keys) => {
        var keyNumbers = keys.map((key) => {
          return this.keyConverter.getNumberForKeyString(formatKey(key));
        });
        return options.maximumInterval >= _.max(keyNumbers) - _.min(keyNumbers);
      };

      var randomChord = generateChord();
      while (!ensureInterval(randomChord)) {
        randomChord = generateChord();
      }

      var staveChord = new Vex.Flow.StaveNote({
        clef : clef,
        keys : randomChord.map(formatKey),
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
