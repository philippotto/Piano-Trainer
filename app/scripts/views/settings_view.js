import React, {Component} from "react";
import RangeSettingComponent from "./range_setting_component";
import KeyConverter from "../services/key_converter";
import _ from "lodash";

export default class SettingsView extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      violinValues: [1, 3],
      bassValues: [1, 3],
      keySignature: [7, 7]
    };
  }

  buildStateChanger(stateKey) {
    return (newValue) => {
      this.setState({
        [stateKey]: newValue
      });
    }
  }

  render() {
    const rangeContainerStyle = {
      marginLeft: "10",
      width: "30%",
      display: "inline-block",
      marginRight: "10",
      marginBottom: -"2",
    };

    const keyConverter = new KeyConverter();

    return (
      <div id="settings">
        <h3 style={{marginTop: -5}}>Settings</h3>
        <RangeSettingComponent
          rangeMin={1}
          rangeMax={5}
          values={this.state.violinValues}
          onChange={this.buildStateChanger("violinValues")}
          label={"violin notes/chord"}
        />
        <RangeSettingComponent
          rangeMin={1}
          rangeMax={5}
          values={this.state.bassValues}
          onChange={this.buildStateChanger("bassValues")}
          label={"bass notes/chord"}
        />
        <RangeSettingComponent
          rangeMin={0}
          rangeMax={14}
          values={this.state.keySignature}
          onChange={this.buildStateChanger("keySignature")}
          valueToString={keyConverter.keySignatureValueToString}
          label={"signature"}
        />
      </div>
    );
  }
}
