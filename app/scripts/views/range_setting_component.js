import React, { Component } from "react";
import PropTypes from "prop-types";
import { Range } from "rc-slider";
import SettingLine from "./setting_line";
import _ from "lodash";

export default class RangeSettingComponent extends Component {
  static defaultProps = {
    valueToString: _.identity,
    label: "",
  };

  static propTypes = {
    rangeMin: PropTypes.number.isRequired,
    rangeMax: PropTypes.number.isRequired,
    values: PropTypes.oneOfType([
      PropTypes.shape({
        from: PropTypes.number,
        to: PropTypes.number,
      }),
      PropTypes.number,
    ]).isRequired,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string,
    valueToString: PropTypes.func,
    disabled: PropTypes.bool,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      values: this.convertValues(this.props.values),
    };
  }

  /**
   * Converts values received as props to expected form for state
   *
   * @param {number | {from: number, to: number}} values
   * @returns {number[]}
   */
  convertValues(values) {
    return typeof values === "object" ? [values.from, values.to] : [values];
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      values: this.convertValues(newProps.values),
    });
  }

  onChange(values) {
    this.setState({
      values: values,
    });
  }

  onAfterChange(values) {
    this.props.onChange(values.length === 1 ? values[0] : values);
  }

  render() {
    const rangeContainerStyle = {
      marginBottom: -2,
    };

    const valueLabel =
      this.props.label + ": " + this.state.values.map(this.props.valueToString).join(" - ");

    return (
      <SettingLine label={valueLabel}>
        <div style={rangeContainerStyle}>
          <Range
            value={this.state.values}
            min={this.props.rangeMin}
            max={this.props.rangeMax}
            onChange={this.onChange.bind(this)}
            onAfterChange={this.onAfterChange.bind(this)}
            allowCross={false}
            disabled={this.props.disabled}
          />
        </div>
      </SettingLine>
    );
  }
}
