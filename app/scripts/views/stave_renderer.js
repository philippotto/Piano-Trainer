import Vex from "vexflow";
import React, {Component} from "react";
import classNames from "classnames";
import _ from "lodash";

import StatisticsView from "../views/statistics_view.js";
import SettingsView from "../views/settings_view.js";
import MidiService from "../services/midi_service.js";
import BarGenerator from "../services/bar_generator.js";

const successMp3Url = require("file!../../resources/success.mp3");

export default class StaveRenderer extends Component {

  propTypes: {
    currentNotes: React.PropTypes.array,
    currentChordIndex: React.PropTypes.number
  }

  render() {
    return <canvas ref="canvas" id="canvas" />;
  }


  componentDidUpdate() {
    this.draw();
  }


  componentDidMount() {
    this.draw();
  }


  setCanvasExtent(canvas, width, height) {
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width;
    canvas.style.height = height;
  }


  draw() {
    const canvas = this.refs.canvas;
    this.renderer = new Vex.Flow.Renderer(canvas, Vex.Flow.Renderer.Backends.CANVAS);
    this.ctx = this.renderer.getContext();

    const [width, height] = [500, 250];
    const ctx = this.ctx;

    ctx.clear();

    this.setCanvasExtent(canvas, width, height);

    const rightHandStave = new Vex.Flow.Stave(10, 0, width);
    rightHandStave.addClef("treble").setContext(ctx).draw();

    const leftHandStave = new Vex.Flow.Stave(10, 80, width);
    leftHandStave.addClef("bass").setContext(ctx).draw();

    this.colorizeKeys();

    [[rightHandStave, "treble"], [leftHandStave, "bass"]].map(([stave, clef]) => {
      Vex.Flow.Formatter.FormatAndDraw(ctx, stave, this.props.currentNotes[clef]);
    });
  }


  colorizeKeys() {
    Object.keys(this.props.currentNotes).map((key) => {
      const clef = this.props.currentNotes[key];
      clef.forEach((staveNote, index) => {
        const color = index < this.props.currentChordIndex ? "green" : "black";
        _.range(staveNote.getKeys().length).map((noteIndex) => {
          staveNote.setKeyStyle(noteIndex, {fillStyle: color});
        });
      });
    });
  }

}
