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
      if (_.isObject(newValue)) {
        const keys = stateKey.split(".");
        const keyToChange = _.reduce(keys, (acc, key) => acc[key], this.props.settings);
        keyToChange.reset(newValue);
      } else {
        // if stateKey points to a primitive, we cannot use reset
        const keys = stateKey.split(".");
        const parentToChange = _.reduce(keys.slice(0, -1), (acc, key) => acc[key], this.props.settings);
        parentToChange.set({
          [keys.slice(-1)[0]]: newValue
        });
      }
    };
  }

  toggleDottedNotesCheckbox() {
    this.props.settings.set({
      dottedNotes: !this.props.settings.dottedNotes
    });
  }

  toggleTripletsCheckbox() {
    this.props.settings.set({
      triplets: !this.props.settings.triplets
    });
  }

  render() {

    return (
      <div className="settings">
        <h3 style={{marginTop: -5}}>Settings</h3>
        <RangeSettingComponent
          rangeMin={250}
          rangeMax={10000}
          values={this.props.settings.barDuration}
          onChange={this.buildStateChanger("barDuration")}
          label={"Bar duration"}
        />

        <SettingLine className="setting_checkbox" label="Dotted notes">
          <input
           type="checkbox"
           checked={this.props.settings.dottedNotes}
           id="dotted_notes_checkbox"
           name="check"
           onChange={this.toggleDottedNotesCheckbox.bind(this)}
          />
          <label htmlFor="dotted_notes_checkbox"></label>
        </SettingLine>

        <SettingLine className="setting_checkbox" label="Triplets">
          <input
           type="checkbox"
           checked={this.props.settings.triplets}
           id="triplets_checkbox"
           name="check"
           onChange={this.toggleTripletsCheckbox.bind(this)}
          />
          <label htmlFor="triplets_checkbox"></label>
        </SettingLine>
      </div>
    );
  }
}
