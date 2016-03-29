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

  buildCheckboxStateChanger(stateKey) {
    const stateChanger = this.buildStateChanger(stateKey);
    return function(event) {
      return stateChanger(event.currentTarget.checked);
    };
  }

  render() {
    return (
      <div className="settings content-box">
        <h3 style={{marginTop: -5}}>Settings</h3>
        <RangeSettingComponent
          rangeMin={250}
          rangeMax={10000}
          values={this.props.settings.barDuration}
          onChange={this.buildStateChanger("barDuration")}
          label={"Bar duration"}
        />

        <SettingLine className="setting_checkbox" label="Rests">
          <input
           type="checkbox"
           checked={this.props.settings.rests}
           id="rests_checkbox"
           name="check"
           onChange={this.buildCheckboxStateChanger("rests")}
          />
          <label htmlFor="rests_checkbox"></label>
        </SettingLine>

        <SettingLine className="setting_checkbox" label="Label beats">
          <input
           type="checkbox"
           checked={this.props.settings.labelBeats}
           id="label_beats_checkbox"
           name="check"
           onChange={this.buildCheckboxStateChanger("labelBeats")}
          />
          <label htmlFor="label_beats_checkbox"></label>
        </SettingLine>

      </div>
    );
      // <SettingLine className="setting_checkbox" label="Dotted notes">
      //   <input
      //    type="checkbox"
      //    checked={this.props.settings.dottedNotes}
      //    id="dotted_notes_checkbox"
      //    name="check"
      //    onChange={this.buildCheckboxStateChanger("dottedNotes")}
      //   />
      //   <label htmlFor="dotted_notes_checkbox"></label>
      // </SettingLine>

      // <SettingLine className="setting_checkbox" label="Triplets">
      //   <input
      //    type="checkbox"
      //    checked={this.props.settings.triplets}
      //    id="triplets_checkbox"
      //    name="check"
      //    onChange={this.buildCheckboxStateChanger("triplets")}
      //   />
      //   <label htmlFor="triplets_checkbox"></label>
      // </SettingLine>
  }
}
