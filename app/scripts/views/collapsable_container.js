import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import _ from "lodash";

export default class CollapsableContainer extends Component {
  static propTypes = {
    children: PropTypes.node,
    collapsed: PropTypes.bool.isRequired,
    maxHeight: PropTypes.number,
    freeze: PropTypes.bool,
    className: PropTypes.string,
  };

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
        collapsed,
        transition: true,
      }),
    ]).join(" ");

    const maxHeight = this.props.maxHeight || 500;
    const style = collapsed ? {} : { maxHeight };
    const children =
      collapsed && this.props.freeze && this.oldChildren ? this.oldChildren : this.props.children;

    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
}
