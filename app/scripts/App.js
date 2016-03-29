require("html!../index.html");
require("../styles/index.less");
require("font-awesome-webpack");

import React, {Component} from "react";
import PitchReadingView from "./views/pitch_reading_view";
import RhythmReadingView from "./views/rhythm_reading_view";
import StatisticService from "./services/statistic_service.js";
import AppFreezer from "./AppFreezer.js";
import { Nav, NavItem } from 'react-bootstrap';

const pianoBackgroundJpg = require("file!../images/piano-background.jpg");
const githubPng = require("file!../images/github.png");


export default class App extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      activeGame: "pitch"
    };
  }

  toggleGame(newGame) {
    this.setState({
      activeGame: newGame
    });
  }

  render() {
    const appState = AppFreezer.get();

    const activeGame = this.state.activeGame === "pitch" ?
      <PitchReadingView
       statisticService={StatisticService}
       settings={appState.settings.pitchReading}
       key="pitch_game"
      /> :
      <RhythmReadingView
       settings={appState.settings.rhythmReading}
       key="rhythm_game"
      />;

    // <div className="hr_gradient" />
    return (
      <div>
        <img id="image-background" src={pianoBackgroundJpg} />

        <div className="jumbotron">
          <h1>Sheet Music Tutor</h1>
          <h3>Improve your sheet reading skills.</h3>
          <a href="https://github.com/philippotto/Piano-Trainer">
            <img id="github" src={githubPng} />
          </a>

          <div className="row center-xs">
            <div className="col-xs">
              <Nav
               bsStyle="pills" activeKey={this.state.activeGame}
               onSelect={this.toggleGame.bind(this)}
               className="inlineBlock">
                <NavItem eventKey="pitch" className="modeNavItem">Pitch training</NavItem>
                <NavItem eventKey="rhythm" className="modeNavItem">Rhythm training</NavItem>
              </Nav>
            </div>
          </div>
        </div>

        <div className="gameContainer">
          {activeGame}
        </div>
      </div>
    );
  }

  componentDidMount() {
    AppFreezer.on('update', () => this.forceUpdate());
  }
}
