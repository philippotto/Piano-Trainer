require("../styles/index.less");
require("font-awesome-webpack");

import React, {Component} from "react";
import MainView from "./views/main_view";
import StatisticService from "./services/statistic_service.js";


export default class App extends Component {
  render() {
    return (
      <MainView statisticService={new StatisticService()}/>
    );
  }
}
