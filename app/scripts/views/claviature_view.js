import React, {Component} from "react";
import KeyConverter from "../services/key_converter.js";
import classNames from "classnames";

export default class ClaviatureView extends Component {

  propTypes: {
    desiredKeys: React.PropTypes.array,
    keySignature: React.PropTypes.string,
    successCallback: React.PropTypes.func,
    failureCallback: React.PropTypes.func,
    disabled: React.PropTypes.boolean,
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      correctnessOfClickedKeys: {
        // noteName -> true/false
      }
    };
  }

  isNoteCorrect(noteName) {
    let success = false;
    this.props.desiredKeys.map((key) => {
      const keyNumber = KeyConverter.getKeyNumberForKeyString(key, this.props.keySignature);
      const keyString = KeyConverter.getKeyStringForKeyNumber(keyNumber);
      const desiredNoteName = KeyConverter.getNoteFromKeyString(keyString);

      success = desiredNoteName === noteName;
    });
    return success;
  }

  onClick(noteName) {
    const success = this.isNoteCorrect(noteName);
    if (success) {
      this.props.successCallback();
    } else {
      this.props.failureCallback();
    }
    this.setState({
      correctnessOfClickedKeys: {
        [noteName]: success
      }
    })
  }

  renderKey(keyName, keyLabel, color) {
    keyLabel = keyLabel || keyName;
    const className = classNames({
      "black-note": color === "black",
      green: this.isNoteCorrect(keyName)
    });
    return <li
     key={keyName}
     className={className}
     onClick={this.onClick.bind(this, keyName)}>
      {keyLabel}
    </li>
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
    ].map((args) => this.renderKey.apply(this, args));
    return <div className={classNames({"scale noSelect": true, noPointerEvents: this.props.disabled})}>
      <ol>
        {keys}
      </ol>
    </div>;
  }
}

