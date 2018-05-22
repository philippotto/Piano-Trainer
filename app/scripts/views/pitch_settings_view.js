import React, { Component } from "react";
import PropTypes from "prop-types";
import RangeSettingComponent from "./range_setting_component";
import SettingLine from "./setting_line";
import KeyConverter from "../services/key_converter";
import AppFreezer from "../AppFreezer.js";
import _ from "lodash";
import AnalyticsService from "../services/analytics_service.js";

export default class PitchSettingsView extends Component {
  static propTypes = {
    settings: PropTypes.object,
  };

  constructor(props, context) {
    super(props, context);
  }

  buildStateChanger(stateKey) {
    return newValue => {
      if (_.isObject(newValue)) {
        const keys = stateKey.split(".");
        const keyToChange = _.reduce(keys, (acc, key) => acc[key], this.props.settings);
        keyToChange.reset(newValue);
      } else {
        // if stateKey points to a primitive, we cannot use reset
        const keys = stateKey.split(".");
        const parentToChange = _.reduce(
          keys.slice(0, -1),
          (acc, key) => acc[key],
          this.props.settings,
        );
        parentToChange.set({
          [keys.slice(-1)[0]]: newValue,
        });
      }

      AnalyticsService.sendEvent(
        "PitchReading-Settings",
        stateKey + " - " + JSON.stringify(newValue),
      );
    };
  }

  buildCheckboxStateChanger(stateKey) {
    const stateChanger = this.buildStateChanger(stateKey);
    return function(event) {
      return stateChanger(event.currentTarget.checked);
    };
  }

  onMidiSelectChange() {
    AppFreezer.trigger("input:changed", parseInt(this.midiSelect.value, 10));
  }

  render() {
    const midiSettings = this.props.settings.midi;
    const midiInputs = midiSettings.inputs.get();
    const isMidiAvailable = midiInputs.length > 0;
    const tryToUseMidi = this.props.settings.tryToUseMidi;
    const deviceSelector = !isMidiAvailable ? null : (
      <div>
        <SettingLine className="setting_checkbox" label="Use Midi:">
          <input
            type="checkbox"
            checked={tryToUseMidi}
            id="try_to_use_midi_checkbox"
            name="check"
            onChange={this.buildCheckboxStateChanger("tryToUseMidi")}
          />
          <label htmlFor="try_to_use_midi_checkbox" />
        </SettingLine>
        {tryToUseMidi ? (
          <SettingLine label="Midi device">
            <select
              name="select"
              onChange={this.onMidiSelectChange.bind(this)}
              defaultValue={midiSettings.currentInput}
              ref={c => {
                this.midiSelect = c;
              }}
            >
              {midiInputs.map((el, index) => {
                return (
                  <option value={index} key={index}>
                    Device {index + 1}
                  </option>
                );
              })}
            </select>
          </SettingLine>
        ) : null}
      </div>
    );
    const noteRangeSelector = !isMidiAvailable ? null : (
      <div>
        <RangeSettingComponent
          rangeMin={36} // C2
          rangeMax={83} // B5
          values={{
            from: this.props.settings.noteRange[0],
            to: this.props.settings.noteRange[1],
          }}
          onChange={this.buildStateChanger("noteRange")}
          valueToString={KeyConverter.getKeyStringForKeyNumber}
          label={"Note range"}
          disabled={!isMidiAvailable}
        />
      </div>
    );

    const useAutomaticDifficulty = this.props.settings.useAutomaticDifficulty;

    const accuracyStateChanger = this.buildStateChanger("automaticDifficulty.accuracyGoal");
    const newNotesShareStateChanger = this.buildStateChanger("automaticDifficulty.newNotesShare");

    const automaticDifficultySection = (
      <div>
        <RangeSettingComponent
          rangeMin={100}
          rangeMax={10000}
          values={this.props.settings.automaticDifficulty.timeGoal}
          onChange={this.buildStateChanger("automaticDifficulty.timeGoal")}
          valueToString={el => `${el}ms`}
          label={"Time goal"}
        />
        <RangeSettingComponent
          rangeMin={50}
          rangeMax={99}
          values={Math.floor(this.props.settings.automaticDifficulty.accuracyGoal * 100)}
          onChange={value => accuracyStateChanger(value / 100)}
          valueToString={el => `${el}%`}
          label={"Accuracy goal"}
        />
        <RangeSettingComponent
          rangeMin={10}
          rangeMax={100}
          values={Math.floor(this.props.settings.automaticDifficulty.newNotesShare * 100)}
          onChange={value => newNotesShareStateChanger(value / 100)}
          valueToString={el => `${el}%`}
          label={"Share of new notes"}
        />
      </div>
    );

    const manualDifficultySection = (
      <div>
        <RangeSettingComponent
          rangeMin={1}
          rangeMax={5}
          values={{
            from: this.props.settings.chordSizeRanges.treble[0],
            to: this.props.settings.chordSizeRanges.treble[1],
          }}
          onChange={this.buildStateChanger("chordSizeRanges.treble")}
          label={"Treble notes/chord"}
          disabled={!isMidiAvailable}
        />
        <RangeSettingComponent
          rangeMin={1}
          rangeMax={5}
          values={{
            from: this.props.settings.chordSizeRanges.bass[0],
            to: this.props.settings.chordSizeRanges.bass[1],
          }}
          onChange={this.buildStateChanger("chordSizeRanges.bass")}
          label={"Bass notes/chord"}
          disabled={!isMidiAvailable}
        />
        <RangeSettingComponent
          rangeMin={0}
          rangeMax={14}
          values={{
            from: this.props.settings.keySignature[0],
            to: this.props.settings.keySignature[1],
          }}
          onChange={this.buildStateChanger("keySignature")}
          valueToString={KeyConverter.keySignatureValueToString}
          label={"Signature"}
        />
      </div>
    );

    return (
      <div className="settings content-box">
        <h3 style={{ marginTop: -5 }}>Settings</h3>
        {deviceSelector}
        {noteRangeSelector}
        <SettingLine className="setting_checkbox" label="Automatic difficulty:">
          <input
            type="checkbox"
            checked={useAutomaticDifficulty}
            id="automatic_difficulty_checkbox"
            name="check"
            onChange={this.buildCheckboxStateChanger("useAutomaticDifficulty")}
          />
          <label htmlFor="automatic_difficulty_checkbox" />
        </SettingLine>
        {useAutomaticDifficulty ? automaticDifficultySection : manualDifficultySection}
      </div>
    );
    // <SettingLine className="setting_checkbox" label="Accidentals:">
    //   <input
    //    type="checkbox"
    //    checked={this.props.settings.useAccidentals}
    //    id="accidental_checkbox"
    //    name="accidental_checkbox"
    //    onChange={this.buildCheckboxStateChanger("useAccidentals")}
    //   />
    //   <label htmlFor="accidental_checkbox"></label>
    // </SettingLine>
  }
}
