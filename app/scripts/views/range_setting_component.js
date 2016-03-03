import React, {Component, PropTypes} from "react";
import RangeSlider from "react-range-slider";
import _ from "lodash";

const multiplier = 10;

export default class SettingsView extends Component {

  static defaultProps = {
    valueToString: _.identity,
    label: ""
  }

  propTypes: {
    rangeMin: PropTypes.number.isRequired,
    rangeMax: PropTypes.number.isRequired,
    values: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string,
    valueToString: PropTypes.func,
  }

  constructor(props, context) {
    super(props, context);
    this.receiveValueAsProps(this.props);
  }

  receiveValueAsProps(props) {
    this.state = {
      values: props.values.map((el) => el * multiplier)
    };
  }

  componentWillReceiveProps(newProps) {
    this.receiveValueAsProps(newProps);
    console.log("componentWillReceiveProps");
  }

  onChange(event, index, values) {
    this.setState({
      values: values.map((el) => el.value)
    });
  }

  onAfterChange() {
    let newValues = this.state.values.map(this.quantitizeValue).map((el) => el / multiplier);
    this.props.onChange(newValues);
  }

  quantitizeValue(value) {
    return Math.round(value / multiplier) * multiplier;
  }

  render() {
    const upscaledRangeMin = this.props.rangeMin * multiplier;
    const upscaledRangeMax = this.props.rangeMax * multiplier;

    let renderedRangeValues = this.state.values;
    let quantitizedValues = this.state.values.map(this.quantitizeValue);
    // todo only for multiple cursors
    if (_.isEqual(quantitizedValues, [upscaledRangeMax, upscaledRangeMax])) {
      renderedRangeValues = [45, upscaledRangeMax];
    }

    const downScaledValues = quantitizedValues.map((el) => Math.round(el / multiplier));
    const rangeContainerStyle = {
      width: "30%",
      display: "inline-block",
      marginBottom: -2,
      float: "right",
    };

    const valueLabel = downScaledValues
      .map(this.props.valueToString)
      .join(" - ")
      + " " + this.props.label;

    return (
      <div>
        {valueLabel}
        <div style={rangeContainerStyle}>
          <RangeSlider
           cursor
           value={renderedRangeValues}
           min={upscaledRangeMin}
           max={upscaledRangeMax}
           onChange={this.onChange.bind(this)}
           onAfterChange={this.onAfterChange.bind(this)}
          />
        </div>
      </div>
    );
  }
}
