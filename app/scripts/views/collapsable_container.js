import React, {Component} from "react";
import classNames from "classnames";
import _ from "lodash";

export default class BeatVisualization extends Component {

  propTypes: {
    collapsed: React.PropTypes.bool.isRequired,
    maxHeight: React.PropTypes.number,
    freeze: React.PropTypes.bool,
    className: React.PropTypes.string,
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.collapsed && nextProps.children !== this.props.children) {
      this.oldChildren = this.props.children;
    }
  }

  render() {
    const collapsed = this.props.collapsed;
    const className = _.compact([
      this.props.className,
      classNames({
        collapsed, transition: true,
      })
    ]).join(" ");

    const maxHeight = this.props.maxHeight || 300;
    const style = collapsed ? {} : {maxHeight};
    const children = collapsed && this.props.freeze && this.oldChildren ? this.oldChildren : this.props.children;

    return <div className={className} style={style}>
      {children}
    </div>;
  }
}
