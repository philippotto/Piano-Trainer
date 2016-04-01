import React, {Component} from "react";
import {Motion, spring} from 'react-motion';

export default class StarAnimation extends Component {
  constructor() {
    super();
    this.state = {
      animationCount: 0
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.number !== nextProps.number) {
      this.setState({
        animationCount: this.state.animationCount + 1
      });
    }
  }
  render() {
    const className = "fa fa-star star-animation-" + this.state.animationCount % 2;
    return <i className={className} />
  }
}
