import Chartist from "Chartist";
import React, { Component } from "react";
import PureRenderMixin from "react-addons-pure-render-mixin";

export default class LevelView extends Component {
  static propTypes = {
    pieParts: React.PropTypes.array.isRequired
  };

  constructor(props, context) {
    super(props, context);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    return <div ref="chart" className="semi-transparent ct-chart ct-major-eleventh" />;
  }

  componentDidUpdate() {
    new Chartist.Pie(
      this.refs.chart,
      {
        series: this.props.pieParts
      },
      {
        donut: true,
        donutWidth: 30,
        startAngle: 0,
        total: 1,
        showLabel: false
      }
    );
  }
}
