import React, { Component, PropTypes } from "react";

export default class SettingLine extends Component {
  static defaultProps = {
    label: ""
  };

  static propTypes = {
    children: PropTypes.node,
    label: PropTypes.string,
    className: PropTypes.string
  };

  constructor(props, context) {
    super(props, context);
  }

  render() {
    let className = "settingLine row around-xs";
    if (this.props.className) {
      className = [className, this.props.className].join(" ");
    }
    return (
      <div className={className}>
        <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12" style={{ textAlign: "left" }}>
          {this.props.label}
        </div>
        <div className="settingUI col-lg-6 col-md-6 col-sm-6 col-xs-12">
          {this.props.children}
        </div>
      </div>
    );
  }
}
