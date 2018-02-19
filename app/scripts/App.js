require("html!../index.html");
require("../styles/index.less");
require("font-awesome-webpack");

import React, { Component } from "react";
import PitchReadingView from "./views/pitch_reading_view";
import RhythmReadingView from "./views/rhythm_reading_view";
import PrivacyPolicyModal from "./views/privacy_policy_modal";
import ImpressumModal from "./views/impressum_modal";
import NewsletterForm from "./views/newsletter_form";
import PitchStatisticService from "./services/pitch_statistic_service.js";
import RhythmStatisticService from "./services/rhythm_statistic_service.js";
import AnalyticsService from "./services/analytics_service.js";
import AppFreezer from "./AppFreezer.js";
import { Nav, NavItem } from "react-bootstrap";

const pianoBackgroundJpg = require("file!../images/piano-background.jpg");

export default class App extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      activeGame: "pitch",
      showPrivacyPolicy: false,
      showImpressum: false,
    };
  }

  selectGame(newGame) {
    this.setState({
      activeGame: newGame,
    });

    AnalyticsService.sendEvent("GameSelection", newGame);
  }

  render() {
    const appState = AppFreezer.get();

    return (
      <div className="site">
        <div className="site-content">
          <img id="image-background" src={pianoBackgroundJpg} />

          <div className="jumbotron">
            <h1>Sheet Music Tutor</h1>
            <h3>Improve your sheet reading skills.</h3>
            <div className="row center-xs">
              <div className="col-xs">
                <Nav
                  bsStyle="pills"
                  activeKey={this.state.activeGame}
                  onSelect={this.selectGame.bind(this)}
                  className="inlineBlock"
                >
                  <NavItem eventKey="pitch" className="modeNavItem">
                    Pitch training
                  </NavItem>
                  <NavItem eventKey="rhythm" className="modeNavItem">
                    Rhythm training
                  </NavItem>
                </Nav>
              </div>
            </div>
          </div>

          <div className="gameContainer">
            <PitchReadingView
              statisticService={PitchStatisticService}
              settings={appState.settings.pitchReading}
              key="pitch_game"
              isActive={this.state.activeGame === "pitch"}
            />
            <RhythmReadingView
              statisticService={RhythmStatisticService}
              settings={appState.settings.rhythmReading}
              key="rhythm_game"
              isActive={this.state.activeGame !== "pitch"}
            />
          </div>
        </div>
        <footer>
          <div className="subscribe-follow-section row around-md">
            <div className="col-md-4 col-xs-12 left">
              <div className="row">
                <div className="col-md-12 col-xs-12">
                  <h2>Subscribe</h2>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12 col-xs-12">
                  <p>
                    Sheet Music Tutor is still under development. Be first to find out when it gets
                    updates.
                  </p>
                </div>
              </div>
              <NewsletterForm />
            </div>
            <div className="follow-section col-md-4 col-xs-12 left">
              <div className="row">
                <div className="col-md-12 col-xs-12">
                  <h2>Follow</h2>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12 col-xs-12">
                  <p>
                    Follow us on social media to stay up to date on new features or to give us
                    feedback.
                  </p>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12 col-xs-12">
                  <a
                    href="http://facebook.com/SheetMusicTutor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    <i className="fa fa-facebook" />
                  </a>
                  <a
                    href="http://twitter.com/SheetMusicTutor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    <i className="fa fa-twitter" />
                  </a>
                  <a
                    href="http://github.com/philippotto/piano-trainer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    <i className="fa fa-github" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          Created and maintained by <a href="http://github.com/philippotto/">Philipp Otto</a>
          &nbsp;|&nbsp;
          <a href="#" onClick={() => this.setState({ showPrivacyPolicy: true })}>
            Privacy Policy
          </a>
          &nbsp;|&nbsp;
          <a href="#" onClick={() => this.setState({ showImpressum: true })}>
            Impressum
          </a>
          &nbsp;|&nbsp; &copy; {new Date().getFullYear()}
          <PrivacyPolicyModal
            show={this.state.showPrivacyPolicy}
            onHide={() => this.setState({ showPrivacyPolicy: false })}
          />
          <ImpressumModal
            show={this.state.showImpressum}
            onHide={() => this.setState({ showImpressum: false })}
          />
        </footer>
      </div>
    );
  }

  componentDidMount() {
    AppFreezer.on("update", () => this.forceUpdate());
  }
}
