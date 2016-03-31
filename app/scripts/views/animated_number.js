import React, {Component} from "react";
import {Motion, spring} from 'react-motion';

export default class AnimatedNumber extends Component {
  render() {
    const formatter = this.props.formatter;
    const number = this.props.number;
    return <Motion defaultStyle={{x: 1}} style={{x: spring(number)}}>
      {value => <span>{formatter ? formatter(value.x) : Math.round(value.x)}</span>}
    </Motion>;
  }
}
