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
    keys: React.PropTypes.array,
    chordIndex: React.PropTypes.number,
    keySignature: React.PropTypes.string,
    afterRender: React.PropTypes.func,
    staveCount: React.PropTypes.number,
  }

  defaultPropTypes: {
    afterRender: _.noop,
    staveCount: 2,
  }

  render() {
    return <canvas ref="canvas" id="canvas" />;
  }


  componentDidUpdate() {
    this.draw();
    this.props.afterRender();
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

    const [width, height] = [600, this.props.staveCount * 100];
    const staveWidth = 500;
    const ctx = this.ctx;

    ctx.clear();

    this.setCanvasExtent(canvas, width, height);

    const rightHandStave = new Vex.Flow.Stave(10, 0, staveWidth);
    rightHandStave
      .addClef("treble")
      .setKeySignature(this.props.keySignature)
      .setContext(ctx);

    const leftHandStave = new Vex.Flow.Stave(10, 80, staveWidth);
    leftHandStave
      .addClef("bass")
      .setKeySignature(this.props.keySignature)
      .setContext(ctx);

    this.colorizeKeys();

    [[rightHandStave, "treble"], [leftHandStave, "bass"]].map(([stave, clef], index) => {
      const keys = this.props.keys[clef];
      if (index < this.props.staveCount) {
        stave.draw();
        Vex.Flow.Formatter.FormatAndDraw(ctx, stave, keys);
      }
    });
  }


  colorizeKeys() {
    Object.keys(this.props.keys).map((key) => {
      const clef = this.props.keys[key];
      clef.forEach((staveNote, index) => {
        const color = index < this.props.chordIndex ? "green" : "black";
        _.range(staveNote.getKeys().length).map((noteIndex) => {
          staveNote.setKeyStyle(noteIndex, {fillStyle: color});
        });
      });
    });
  }

}
