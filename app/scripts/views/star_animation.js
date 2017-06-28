import React, { Component } from "react";

export default class StarAnimation extends Component {
  static propTypes = {
    number: React.PropTypes.number
  };

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
    return <i className={className} />;
  }
}
