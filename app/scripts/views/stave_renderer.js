import Vex from "vexflow";
import React, { Component } from "react";
import classNames from "classnames";
import _ from "lodash";
import PureRenderMixin from "react-addons-pure-render-mixin";

class StaveRenderer extends Component {
  static defaultProps = {
    staveCount: 2
  };

  propTypes: {
    keys: React.PropTypes.array,
    chordIndex: React.PropTypes.number,
    keySignature: React.PropTypes.string,
    staveCount: React.PropTypes.number
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    return <canvas ref="canvas" id="canvas" />;
  }

  componentDidUpdate() {
    this.draw();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.debouncedResizeHandler);
  }

  componentDidMount() {
    this.draw();
    this.debouncedResizeHandler = _.debounce(this.draw.bind(this), 250);
    window.addEventListener("resize", this.debouncedResizeHandler);
  }

  setCanvasExtent(canvas, width, height, ratio) {
    canvas.width = ratio * width;
    canvas.height = ratio * height;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  getPixelRatio() {
    const ctx = this.ctx,
      dpr = window.devicePixelRatio || 1,
      bsr =
        ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio ||
        1;
    return dpr / bsr;
  }

  draw() {
    const canvas = this.refs.canvas;
    this.renderer = new Vex.Flow.Renderer(canvas, Vex.Flow.Renderer.Backends.CANVAS);
    this.ctx = this.renderer.getContext();

    const windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    const widthThreshold = 600;
    const margin = 20;
    const width = windowWidth >= widthThreshold ? widthThreshold : windowWidth - margin;
    const staveWidth = width - margin;
    const height = this.props.staveCount * 100;
    const ctx = this.ctx;

    ctx.clear();

    const ratio = this.getPixelRatio();
    this.setCanvasExtent(canvas, width, height, ratio);

    const rightHandStave = new Vex.Flow.Stave(10, 0, staveWidth);
    rightHandStave.addClef("treble").setKeySignature(this.props.keySignature).setContext(ctx);

    const leftHandStave = new Vex.Flow.Stave(10, 80, staveWidth);
    leftHandStave.addClef("bass").setKeySignature(this.props.keySignature).setContext(ctx);

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
    Object.keys(this.props.keys).map(key => {
      const clef = this.props.keys[key];
      clef.forEach((staveNote, index) => {
        const color = index < this.props.chordIndex ? "#398439" : "black";
        _.range(staveNote.getKeys().length).map(noteIndex => {
          staveNote.setKeyStyle(noteIndex, { fillStyle: color });
        });
      });
    });
  }
}

export default StaveRenderer;
