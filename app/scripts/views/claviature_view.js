import React, { Component } from "react";
import KeyConverter from "../services/key_converter.js";
import classNames from "classnames";

export default class ClaviatureView extends Component {
  propTypes: {
    desiredKeys: React.PropTypes.array,
    keySignature: React.PropTypes.string,
    successCallback: React.PropTypes.func,
    failureCallback: React.PropTypes.func,
    disabled: React.PropTypes.bool
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      // The key which is currently "clicked". Only used for keyboard navigation.
      activeKey: null
    };
  }

  static contextTypes = {
    isInActiveView: React.PropTypes.bool
  };

  isNoteCorrect(noteName) {
    let success = false;
    this.props.desiredKeys.map(key => {
      const keyNumber = KeyConverter.getKeyNumberForKeyString(key, this.props.keySignature);
      const keyString = KeyConverter.getKeyStringForKeyNumber(keyNumber);
      const desiredNoteName = KeyConverter.getNoteFromKeyString(keyString);

      success = desiredNoteName === noteName;
    });
    return success;
  }

  componentDidMount() {
    const keyHandler = (eventType, event) => {
      if (!this.context.isInActiveView) {
        return;
      }

      const charCode = event.which || event.keyCode;
      const noteName = String.fromCharCode(charCode).toLowerCase();
      if ("cdefgab".indexOf(noteName) === -1) {
        return;
      }
      if (eventType === "keydown") {
        this.setState({
          activeKey: noteName
        });
      } else {
        this.setState({
          activeKey: null
        });
        this.onClick(noteName);
      }
    };
    this.keyHandlers = {
      keydown: keyHandler.bind(this, "keydown"),
      keyup: keyHandler.bind(this, "keyup")
    };
    document.addEventListener("keydown", this.keyHandlers.keydown);
    document.addEventListener("keyup", this.keyHandlers.keyup);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.keyHandlers.keydown);
    document.removeEventListener("keyup", this.keyHandlers.keyup);
  }

  onClick(noteName) {
    const success = this.isNoteCorrect(noteName);
    if (success) {
      this.props.successCallback();
    } else {
      this.props.failureCallback();
    }
  }

  renderKey(keyName, keyLabel, color) {
    keyLabel = keyLabel || keyName;
    const className = classNames({
      "black-note": color === "black",
      green: this.isNoteCorrect(keyName),
      active: keyName === this.state.activeKey
    });
    return (
      <li ref={keyName} key={keyName} className={className} onClick={this.onClick.bind(this, keyName)}>
        {keyLabel}
      </li>
    );
  }

  render() {
    const keys = [
      ["c", "C", "white"],
      ["c#", "C# D♭", "black"],
      ["d", "D", "white"],
      ["d#", "D# E♭", "black"],
      ["e", "E", "white"],
      ["f", "F", "white"],
      ["f#", "F# G♭", "black"],
      ["g", "G", "white"],
      ["g#", "G# A♭", "black"],
      ["a", "A", "white"],
      ["a#", "A# B♭", "black"],
      ["b", "B", "white"]
    ].map(args => this.renderKey.apply(this, args));
    return (
      <div className={classNames({ "scale noSelect": true, noPointerEvents: this.props.disabled })}>
        <ol>
          {keys}
        </ol>
      </div>
    );
  }
}
