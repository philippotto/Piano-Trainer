import React, {Component} from "react";
import classNames from "classnames";
import _ from "lodash";
import { Button, ButtonToolbar } from 'react-bootstrap';

export default class GameButton extends Component {

  propTypes: {
    label: React.PropTypes.string.isRequired,
    onClick: React.PropTypes.func.isRequired,
    primary: React.PropTypes.boolean,
    shortcutLetter: React.PropTypes.string,
  }

  componentDidMount() {
    this.keyHandler = (event) => {
      const isPrimaryAndEnter = this.props.primary && event.code === "Enter";
      const charCode = event.which || event.keyCode;
      const isShortcutLetter = String.fromCharCode(charCode) === this.props.shortcutLetter;
      if (isPrimaryAndEnter || isShortcutLetter) {
        return this.props.onClick();
      } else {
        return false;
      }
    };

    document.addEventListener("keypress", this.keyHandler);
  }

  componentWillUnmount() {
    document.removeEventListener("keypress", this.keyHandler);
  }

  render() {
    const subtext = this.props.shortcutLetter ?
      <div>
        <span style={{fontSize: 12}}>Or press '{this.props.shortcutLetter}'</span>
      </div> :
      null;

    return <Button
      onClick={this.props.onClick}
      bsStyle={this.props.primary ? "success" : "default"}
      style={{marginLeft: 10, marginRight: 10}}>
      <span style={{fontSize: 18}}>{this.props.label}</span>
      {subtext}
    </Button>;
  }
}
