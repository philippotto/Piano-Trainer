import React, {Component} from "react";
import RangeSettingComponent from "./range_setting_component";
import SettingLine from "./setting_line";
import KeyConverter from "../services/key_converter";
import AppFreezer from "../AppFreezer.js";
import _ from "lodash";

export default class PitchSettingsView extends Component {

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
    const midiSettings = this.props.settings.midi;
    const midiInputs = midiSettings.inputs.get();
    const deviceSelector = midiInputs.length <= 1 ?
      null :
      <SettingLine label="Midi device">
        <select
         name="select"
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
      </SettingLine>;

    return (
      <div className="settings">
        <h3 style={{marginTop: -5}}>Settings</h3>
        <RangeSettingComponent
          rangeMin={1}
          rangeMax={5}
          values={this.props.settings.chordSizeRanges.treble}
          onChange={this.buildStateChanger("chordSizeRanges.treble")}
          label={"Treble notes/chord"}
        />
        <RangeSettingComponent
          rangeMin={1}
          rangeMax={5}
          values={this.props.settings.chordSizeRanges.bass}
          onChange={this.buildStateChanger("chordSizeRanges.bass")}
          label={"Bass notes/chord"}
        />
        <RangeSettingComponent
          rangeMin={0}
          rangeMax={14}
          values={this.props.settings.keySignature}
          onChange={this.buildStateChanger("keySignature")}
          valueToString={KeyConverter.keySignatureValueToString}
          label={"Signature"}
        />

        <SettingLine className="setting_checkbox" label="Accidentals:">
          <input
           type="checkbox"
           checked={this.props.settings.useAccidentals}
           id="accidental_checkbox"
           name="check"
           onChange={this.toggleAccidentalsCheckbox.bind(this)}
          />
          <label htmlFor="accidental_checkbox"></label>
        </SettingLine>
      </div>
    );
  }
}
