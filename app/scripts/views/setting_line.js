import React, {Component, PropTypes} from "react";
import _ from "lodash";


export default class SettingLine extends Component {

  static defaultProps = {
    label: ""
  }

  propTypes: {
    label: PropTypes.string,
    className: PropTypes.string,

  }

  constructor(props, context) {
    super(props, context);
  }

  render() {
    let className = "row around-xs";
    if (this.props.className) {
      className = [className, this.props.className].join(" ");
    }
    return (
      <div className={className}>
        <div className="col-xs-6" style={{textAlign: "left"}}>
          {this.props.label}
        </div>
        <div className="col-xs-6">
          {this.props.children}
        </div>
      </div>
    );
  }
}
