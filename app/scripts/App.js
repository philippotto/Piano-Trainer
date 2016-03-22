require("html!../index.html");
require("../styles/index.less");
require("font-awesome-webpack");

import React, {Component} from "react";
import MainView from "./views/main_view";
import StatisticService from "./services/statistic_service.js";
import AppFreezer from "./AppFreezer.js";

export default class App extends Component {
  render() {
    const state = AppFreezer.get();
    return (
      <MainView
       statisticService={StatisticService}
       settings={state.settings}
      />
    );
  }

  componentDidMount() {
    AppFreezer.on('update', () => this.forceUpdate());
  }
}
