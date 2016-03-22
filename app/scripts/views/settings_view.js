import React, {Component} from "react";
import RangeSettingComponent from "./range_setting_component";
import KeyConverter from "../services/key_converter";
import AppFreezer from "../AppFreezer.js";
import _ from "lodash";

export default class SettingsView extends Component {

  constructor(props, context) {
    super(props, context);
  }

  buildStateChanger(stateKey) {
    return (newValue) => {
      const keys = stateKey.split(".");
      const keyToChange = _.reduce(keys, (acc, key) => acc[key], this.props.settings);
      keyToChange.reset(newValue);
    };
  }

  toggleAccidentalsCheckbox() {
    this.props.settings.set({
      useAccidentals: !this.props.settings.useAccidentals
    });
  }

  onMidiSelectChange(event) {
    AppFreezer.trigger("input:changed", parseInt(this.refs.midiSelect.value));
  }

  render() {
    const rangeContainerStyle = {
      marginLeft: "10",
      width: "30%",
      display: "inline-block",
      marginRight: "10",
      marginBottom: -2,
    };



    const midiSettings = this.props.settings.midi;
    const midiInputs = midiSettings.inputs.get();
    const deviceSelector = midiInputs.length <= 1 ?
      null :
      <div>
        Midi device:
        <select
         name="select"
         className="pull-right"
         onChange={this.onMidiSelectChange.bind(this)}
         defaultValue={midiSettings.currentInput}
         ref="midiSelect"
        >
          {midiInputs.map((el, index) => {
            return (
              <option
               value={index}
               key={index}
              >
                Device {index + 1}
              </option>
            );
          })}
        </select>
      </div>;

    return (
      <div id="settings">
        <h3 style={{marginTop: -5}}>Settings</h3>
        {deviceSelector}
        <RangeSettingComponent
          rangeMin={1}
          rangeMax={5}
          values={this.props.settings.chordSizeRanges.treble}
          onChange={this.buildStateChanger("chordSizeRanges.treble")}
          label={"treble notes/chord"}
        />
        <RangeSettingComponent
          rangeMin={1}
          rangeMax={5}
          values={this.props.settings.chordSizeRanges.bass}
          onChange={this.buildStateChanger("chordSizeRanges.bass")}
          label={"bass notes/chord"}
        />
        <RangeSettingComponent
          rangeMin={0}
          rangeMax={14}
          values={this.props.settings.keySignature}
          onChange={this.buildStateChanger("keySignature")}
          valueToString={KeyConverter.keySignatureValueToString}
          label={"signature"}
        />

        <div>
          Accidentals: On/Off
          <div className="accidental_checkbox pull-right">
            <input
             type="checkbox"
             checked={this.props.settings.useAccidentals}
             id="accidental_checkbox"
             name="check"
             onChange={this.toggleAccidentalsCheckbox.bind(this)}
            />
            <label htmlFor="accidental_checkbox"></label>
          </div>
        </div>
      </div>
    );
  }
}
