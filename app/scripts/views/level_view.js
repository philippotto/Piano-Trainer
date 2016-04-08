import Chartist from "Chartist";
import React, {Component} from "react";
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import LevelService from "../services/level_service.js";
import PieChart from "../views/pie_chart.js";


export default class LevelView extends Component {

  propTypes: {
    statisticService: React.PropTypes.object.isRequired,
  }

  render() {
    const statistics = this.props.statisticService;
    const events = statistics.getAllEvents();

    const levelIndex = LevelService.getLevelOfUser(events);
    const nextLevel = LevelService.getLevelByIndex(levelIndex + 1);
    let content = null;
    if (nextLevel) {
      const evaluation = LevelService.assessLevel(events, nextLevel);

      const goodEnoughProgress = evaluation.goodEnoughKeys.length /
        (evaluation.goodEnoughKeys.length + evaluation.notGoodEnoughKeys.length) || 0;

      const notGoodEnoughEvaluations = _.flatten(evaluation.notGoodEnoughKeys.map((keyEvaluation) => {
        const evaluationDetails = keyEvaluation.details;
        const evaluationThresholds = evaluationDetails.thresholds;

        // if you are slower than 30s, it is still considered as 30s
        const longestTimeThreshold = 30000;
        const clampedTime = _.clamp(evaluationDetails.time, evaluationThresholds.time, longestTimeThreshold);

        const timeProgress = 1 - (clampedTime - evaluationThresholds.time) / (longestTimeThreshold - evaluationThresholds.time);
        const accuracyProgress = Math.min(1, evaluationDetails.accuracy / evaluationThresholds.accuracy);
        const amountProgress = Math.min(1, evaluationDetails.eventsLength / evaluationThresholds.amount);
        return [timeProgress, accuracyProgress, amountProgress].map((el) => el / 3);
      })).map((el) => el / evaluation.notGoodEnoughKeys.length * (1 - goodEnoughProgress));

      const pieParts = _.compact([goodEnoughProgress].concat(notGoodEnoughEvaluations));
      if (pieParts.length > 0) {
        content = <PieChart pieParts={pieParts} />;
      } else {
        content = <div>
          <h4>
            Congratulations! You reached the next level!
          </h4>
          <p>Complete this bar to see the new level.</p>
        </div>;
      }
    } else {
      content = <div>
        <h4>
          Congratulations! You finished the final level!
        </h4>
        <p>You may want to increase your goals in the settings pane or switch to the manual training mode.</p>
      </div>;
    }

    // Missing notes: {statistics.calculateMissingSuccessfulNotes()}
    return (
      <div>
        {content}
        <div>
          Current level: {levelIndex + 2}
        </div>
      </div>
    );
  }
}



