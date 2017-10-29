import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";

export default class GameButton extends Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    primary: PropTypes.bool,
    shortcutLetter: PropTypes.string,
  };

  static contextTypes = {
    isInActiveView: PropTypes.bool,
  };

  componentDidMount() {
    this.keyHandler = event => {
      if (!this.context.isInActiveView) {
        return;
      }

      if (!this.props.shortcutLetter) {
        return;
      }
      const isPrimaryAndEnter = this.props.primary && event.code === "Enter";
      const charCode = event.which || event.keyCode;
      const isShortcutLetter = String.fromCharCode(charCode) === this.props.shortcutLetter;
      if (isPrimaryAndEnter || isShortcutLetter) {
        this.props.onClick();
      }
    };

    document.addEventListener("keypress", this.keyHandler);
  }

  componentWillUnmount() {
    document.removeEventListener("keypress", this.keyHandler);
  }

  render() {
    const subtext = this.props.shortcutLetter ? (
      <div>
        <span style={{ fontSize: 12 }}>Or press &lsquo;{this.props.shortcutLetter}&rsquo;</span>
      </div>
    ) : null;

    return (
      <Button
        onClick={this.props.onClick}
        bsStyle={this.props.primary ? "success" : "default"}
        className="gameButton"
      >
        <span className="gameButton-label">{this.props.label}</span>
        <span className="subtext">{subtext}</span>
      </Button>
    );
  }
}
