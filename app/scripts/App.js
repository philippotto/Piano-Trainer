require("html!../index.html");
require("../styles/index.less");
require("font-awesome-webpack");

import React, {Component} from "react";
import MainView from "./views/main_view";
import StatisticService from "./services/statistic_service.js";
import Freezer from "freezer-js";

let freezer = new Freezer({
  settings: {
    chordSizeRanges: {
      treble: [1, 3],
      bass: [1, 3],
    },
    keySignature: [7, 7],
    useAccidentals: false,
  }
});

export default class App extends Component {
  render() {
    const state = freezer.get();
    return (
      <MainView
       statisticService={StatisticService}
       settings={state.settings}
      />
    );
  }

  componentDidMount() {
    freezer.on('update', () => this.forceUpdate());
  }
}
