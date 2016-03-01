// ### define
// jquery : $
// backbone : Backbone
// vexflow : Vex
// services/midi_service : MidiService
// services/statistic_service : StatisticService
// services/key_converter : KeyConverter
// ./statistics_view : StatisticsView
// ###

export default class MainView extends Backbone.Marionette.ItemView {


  template() {
    return _.template(`
      <img id="image-background" src="images/piano-background.jpg">

      <div class="jumbotron">
        <h1>Piano Trainer</h1>
        <a href="https://github.com/philippotto/Piano-Trainer">
          <img id="github" src="images/github.png">
        </a>
      </div>

      <div class="too-small">
        <div class="message">
          <p>
            This page is meant to be viewed on a sufficiently large screen with a MIDI enabled device connected.
            If you are interested to learn more about Piano-Trainer, view <a href="http://github.com/philippotto/Piano-Trainer">this page.</a>
          </p>
        </div>
      </div>

      <div class="trainer">
        <div class="Aligner">
          <div class="Aligner-item">
            <canvas></canvas>
          </div>
        </div>

        <div id="message-container" class="Aligner hide">
          <div class="Aligner-item message Aligner">
            <div>
              <h3 id="error-message"></h3>
              <h4>
                Have a look into the <a href="https://github.com/philippotto/Piano-Trainer#how-to-use">Set Up</a> section.
              </h4>
            </div>
          </div>
        </div>

        <div id="statistics"></div>
        <audio id="success-player" hidden="true" src="success.mp3" controls preload="auto" autobuffer></audio>
      </div>
    `);
  }


  ui() {
    return {
      "canvas" : "canvas",
      "statistics" : "#statistics",
      "errorMessage" : "#error-message",
      "messageContainer" : "#message-container"
    };
  }


  onRender() {

    this.statisticService = new StatisticService();
    this.statisticsView = new StatisticsView({statisticService : this.statisticService});
    this.renderStatistics();

    // find a way to remove this dirty work around
    setTimeout(
      () => this.renderStatistics(),
      0
    );


    this.keyConverter = new KeyConverter();

    this.midiService = new MidiService(
      this.onSuccess.bind(this),
      this.onFailure.bind(this),
      this.onError.bind(this),
      this.onErrorResolve.bind(this)
    );
    this.initializeRenderer();
    return this.renderStave();
  }


  onError(msg, args) {

    console.error.apply(console, arguments);
    this.ui.errorMessage.html(msg);
    return this.ui.messageContainer.removeClass("hide");
  }


  onErrorResolve() {

    return this.ui.messageContainer.addClass("hide");
  }


  getAllCurrentKeys() {

    return [].concat(
      this.currentNotes["treble"][this.currentChordIndex].getKeys(),
      this.currentNotes["bass"][this.currentChordIndex].getKeys()
    );
  }


  onSuccess() {

    var event =
      {success : true,
      keys : this.getAllCurrentKeys(),
      time : new Date() - this.startDate
      };

    var timeThreshold = 30000;

    if (event.time <= timeThreshold) {
      this.statisticService.register(event);
      this.onErrorResolve();
    } else {
      // don't save events which took too long
      // we don't want to drag the statistics down when the user made a break
      this.onError("Since you took more than " + timeThreshold/1000 + " seconds, we ignored this event to avoid dragging down your statistics. Hopefully, you just made a break in between :)");
    }

    this.currentChordIndex++;
    this.renderStave();
    this.renderStatistics();
    return this.playSuccessSound();
  }


  playSuccessSound() {

    return document.getElementById('success-player').play();
  }


  onFailure() {

    this.statisticService.register(
      {success : false,
      keys : this.getAllCurrentKeys(),
      time : new Date() - this.startDate}
    );

    return this.renderStatistics();
  }


  renderStatistics() {

    this.ui.statistics.html(this.statisticsView.render().el);
    return this.statisticsView.renderChart();
  }


  initializeRenderer() {

    this.renderer = new Vex.Flow.Renderer(this.ui.canvas.get(0), Vex.Flow.Renderer.Backends.CANVAS);
    return this.ctx = this.renderer.getContext();
  }


  setCanvasExtent(width, height) {

    var canvas = this.ui.canvas.get(0);
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width;
    return canvas.style.height = height;
  }


  renderStave() {

    this.startDate = new Date();

    var [width, height] = [500, 250];
    var [renderer, ctx] = [this.renderer, this.ctx];

    ctx.clear();

    this.setCanvasExtent(width, height);

    var rightHandStave = new Vex.Flow.Stave(10, 0, width);
    rightHandStave.addClef("treble").setContext(ctx).draw();

    var leftHandStave = new Vex.Flow.Stave(10, 80, width);
    leftHandStave.addClef("bass").setContext(ctx).draw();

    if (!this.currentNotes || this.currentChordIndex >= this.currentNotes.treble.length) {
      this.currentNotes =
        {treble : this.generateBar("treble"),
        bass : this.generateBar("bass")
        };
    }

    this.colorizeKeys();

    [[rightHandStave, "treble"], [leftHandStave, "bass"]].map(([stave, clef]) => {
      return Vex.Flow.Formatter.FormatAndDraw(ctx, stave, this.currentNotes[clef]);
    });

    return this.midiService.setDesiredKeys(this.getAllCurrentKeys());
  }


  colorizeKeys() {

    return Objec.keys(this.currentNotes).map((key) => {
      var clef = this.currentNotes[key];
      return clef.forEach((staveNote, index) => {
        var color = index < this.currentChordIndex ? "green" : "black";
        return _.range(staveNote.getKeys().length).map((index) => {
          return staveNote.setKeyStyle(index, {fillStyle: color});
        }
        );
      }

      );
    }
    );
  }


  getBaseNotes() {

    return "cdefgab".split("");
  }


  generateBar(clef) {

    var options =
      {notesPerBar : 4,
      maximumKeysPerChord : 3,
      withModifiers : false,
      levels :
        {bass : [2, 3],
        treble : [4, 5]
        },
      maximumInterval : 12
      };

    this.currentChordIndex = 0;

    var baseModifiers = options.withModifiers ? ["", "b", "#"] : [""];

    var generatedChords = _.range(0, options.notesPerBar).map( () => {

      var randomLevel = _.sample(options.levels[clef]);

      var generateNote = function(baseNotes) {

        var randomNoteIndex = _.random(0, baseNotes.length - 1);
        var note = baseNotes.splice(randomNoteIndex, 1)[0];

        var modifier = _.sample(baseModifiers);
        return {note, modifier};
      };


      var generateChord = () => {

        var keys;
        var baseNotes = this.getBaseNotes();
        return keys = _.times(_.random(1, options.maximumKeysPerChord), function() {
          return generateNote(baseNotes);
        }
        );
      };


      var formatKey = function({note, modifier}) { return note + modifier + "/" + randomLevel; };


      var ensureInterval = (keys) => {

        var keyNumbers = keys.map((key) => {
          return this.keyConverter.getNumberForKeyString(formatKey(key));
        }
        );
        return options.maximumInterval >= _.max(keyNumbers) - _.min(keyNumbers);
      };


      var randomChord = generateChord();
      while (!ensureInterval(randomChord)) {
        randomChord = generateChord();
      }


      var staveChord = new Vex.Flow.StaveNote(
        {clef : clef,
        keys : randomChord.map(formatKey),
        duration: `//{options.notesPerBar}`}
      );

      randomChord.forEach(({note, modifier}, index) => {
        if (modifier) {
          staveChord.addAccidental(index, new Vex.Flow.Accidental(modifier));
        }

        return staveChord;
      }
      );

      return staveChord;
    }
    );

    return generatedChords;
  }
}
