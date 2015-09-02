(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["jquery", "backbone", "vexflow", "services/midi_service", "services/statistic_service", "services/key_converter", "./statistics_view"], function($, Backbone, Vex, MidiService, StatisticService, KeyConverter, StatisticsView) {
    var MainView;
    return MainView = (function(_super) {
      __extends(MainView, _super);

      function MainView() {
        return MainView.__super__.constructor.apply(this, arguments);
      }

      MainView.prototype.template = _.template("<img id=\"image-background\" src=\"images/piano-background.jpg\">\n\n<div class=\"jumbotron\">\n  <h1>Piano Trainer</h1>\n  <a href=\"https://github.com/philippotto/Piano-Trainer\">\n    <img id=\"github\" src=\"images/github.png\">\n  </a>\n</div>\n\n<div class=\"too-small\">\n  <div class=\"message\">\n    <p>\n      This page is meant to be viewed on a sufficiently large screen with a MIDI enabled device connected.\n      If you are interested to learn more about Piano-Trainer, view <a href=\"http://github.com/philippotto/Piano-Trainer\">this page.</a>\n    </p>\n  </div>\n</div>\n\n<div class=\"trainer\">\n  <div class=\"Aligner\">\n    <div class=\"Aligner-item\">\n      <canvas></canvas>\n    </div>\n  </div>\n\n  <div id=\"message-container\" class=\"Aligner hide\">\n    <div class=\"Aligner-item message Aligner\">\n      <div>\n        <h3 id=\"error-message\"></h3>\n        <h4>\n          Have a look into the <a href=\"https://github.com/philippotto/Piano-Trainer#how-to-use\">Set Up</a> section.\n        </h4>\n      </div>\n    </div>\n  </div>\n\n  <div id=\"statistics\"></div>\n  <audio id=\"success-player\" hidden=\"true\" src=\"success.mp3\" controls preload=\"auto\" autobuffer></audio>\n</div>");

      MainView.prototype.ui = {
        "canvas": "canvas",
        "statistics": "#statistics",
        "errorMessage": "#error-message",
        "messageContainer": "#message-container"
      };

      MainView.prototype.onRender = function() {
        this.statisticService = new StatisticService();
        this.statisticsView = new StatisticsView({
          statisticService: this.statisticService
        });
        this.renderStatistics();
        setTimeout((function(_this) {
          return function() {
            return _this.renderStatistics();
          };
        })(this), 0);
        this.keyConverter = new KeyConverter();
        this.midiService = new MidiService(this.onSuccess.bind(this), this.onFailure.bind(this), this.onError.bind(this), this.onErrorResolve.bind(this));
        this.initializeRenderer();
        return this.renderStave();
      };

      MainView.prototype.onError = function(msg, args) {
        console.error.apply(console, arguments);
        this.ui.errorMessage.html(msg);
        return this.ui.messageContainer.removeClass("hide");
      };

      MainView.prototype.onErrorResolve = function() {
        return this.ui.messageContainer.addClass("hide");
      };

      MainView.prototype.getAllCurrentKeys = function() {
        return [].concat(this.currentNotes["treble"][this.currentChordIndex].getKeys(), this.currentNotes["bass"][this.currentChordIndex].getKeys());
      };

      MainView.prototype.onSuccess = function() {
        var event, timeThreshold;
        event = {
          success: true,
          keys: this.getAllCurrentKeys(),
          time: new Date() - this.startDate
        };
        timeThreshold = 30000;
        if (event.time <= timeThreshold) {
          this.statisticService.register(event);
          this.onErrorResolve();
        } else {
          this.onError("Since you took more than " + timeThreshold / 1000 + " seconds, we ignored this event to avoid dragging down your statistics. Hopefully, you just made a break in between :)");
        }
        this.currentChordIndex++;
        this.renderStave();
        this.renderStatistics();
        return this.playSuccessSound();
      };

      MainView.prototype.playSuccessSound = function() {
        return document.getElementById('success-player').play();
      };

      MainView.prototype.onFailure = function() {
        this.statisticService.register({
          success: false,
          keys: this.getAllCurrentKeys(),
          time: new Date() - this.startDate
        });
        return this.renderStatistics();
      };

      MainView.prototype.renderStatistics = function() {
        this.ui.statistics.html(this.statisticsView.render().el);
        return this.statisticsView.renderChart();
      };

      MainView.prototype.initializeRenderer = function() {
        this.renderer = new Vex.Flow.Renderer(this.ui.canvas.get(0), Vex.Flow.Renderer.Backends.CANVAS);
        return this.ctx = this.renderer.getContext();
      };

      MainView.prototype.setCanvasExtent = function(width, height) {
        var canvas;
        canvas = this.ui.canvas.get(0);
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = width;
        return canvas.style.height = height;
      };

      MainView.prototype.renderStave = function() {
        var ctx, height, leftHandStave, renderer, rightHandStave, width, _ref, _ref1;
        this.startDate = new Date();
        _ref = [500, 250], width = _ref[0], height = _ref[1];
        _ref1 = [this.renderer, this.ctx], renderer = _ref1[0], ctx = _ref1[1];
        ctx.clear();
        this.setCanvasExtent(width, height);
        rightHandStave = new Vex.Flow.Stave(10, 0, width);
        rightHandStave.addClef("treble").setContext(ctx).draw();
        leftHandStave = new Vex.Flow.Stave(10, 80, width);
        leftHandStave.addClef("bass").setContext(ctx).draw();
        if (!this.currentNotes || this.currentChordIndex >= this.currentNotes.treble.length) {
          this.currentNotes = {
            treble: this.generateBar("treble"),
            bass: this.generateBar("bass")
          };
        }
        this.colorizeKeys();
        [[rightHandStave, "treble"], [leftHandStave, "bass"]].map((function(_this) {
          return function(_arg) {
            var clef, stave;
            stave = _arg[0], clef = _arg[1];
            return Vex.Flow.Formatter.FormatAndDraw(ctx, stave, _this.currentNotes[clef]);
          };
        })(this));
        return this.midiService.setDesiredKeys(this.getAllCurrentKeys());
      };

      MainView.prototype.colorizeKeys = function() {
        var clef, key, _ref, _results;
        _ref = this.currentNotes;
        _results = [];
        for (key in _ref) {
          if (!__hasProp.call(_ref, key)) continue;
          clef = _ref[key];
          _results.push(clef.forEach((function(_this) {
            return function(staveNote, index) {
              var color, _i, _ref1, _results1;
              color = index < _this.currentChordIndex ? "green" : "black";
              _results1 = [];
              for (index = _i = 0, _ref1 = staveNote.getKeys().length; 0 <= _ref1 ? _i < _ref1 : _i > _ref1; index = 0 <= _ref1 ? ++_i : --_i) {
                _results1.push(staveNote.setKeyStyle(index, {
                  fillStyle: color
                }));
              }
              return _results1;
            };
          })(this)));
        }
        return _results;
      };

      MainView.prototype.getBaseNotes = function() {
        return "cdefgab".split("");
      };

      MainView.prototype.generateBar = function(clef) {
        var baseModifiers, generatedChords, options;
        options = {
          notesPerBar: 4,
          maximumKeysPerChord: 3,
          withModifiers: false,
          levels: {
            bass: [2, 3],
            treble: [4, 5]
          },
          maximumInterval: 12
        };
        this.currentChordIndex = 0;
        baseModifiers = options.withModifiers ? ["", "b", "#"] : [""];
        generatedChords = _.range(0, options.notesPerBar).map((function(_this) {
          return function() {
            var ensureInterval, formatKey, generateChord, generateNote, randomChord, randomLevel, staveChord;
            randomLevel = _.sample(options.levels[clef]);
            generateNote = function(baseNotes) {
              var modifier, note, randomNoteIndex;
              randomNoteIndex = _.random(0, baseNotes.length - 1);
              note = baseNotes.splice(randomNoteIndex, 1)[0];
              modifier = _.sample(baseModifiers);
              return {
                note: note,
                modifier: modifier
              };
            };
            generateChord = function() {
              var baseNotes, keys;
              baseNotes = _this.getBaseNotes();
              return keys = _.times(_.random(1, options.maximumKeysPerChord), function() {
                return generateNote(baseNotes);
              });
            };
            formatKey = function(_arg) {
              var modifier, note;
              note = _arg.note, modifier = _arg.modifier;
              return note + modifier + "/" + randomLevel;
            };
            ensureInterval = function(keys) {
              var keyNumbers;
              keyNumbers = keys.map(function(key) {
                return _this.keyConverter.getNumberForKeyString(formatKey(key));
              });
              return options.maximumInterval >= _.max(keyNumbers) - _.min(keyNumbers);
            };
            randomChord = generateChord();
            while (!ensureInterval(randomChord)) {
              randomChord = generateChord();
            }
            staveChord = new Vex.Flow.StaveNote({
              clef: clef,
              keys: randomChord.map(formatKey),
              duration: "" + options.notesPerBar
            });
            randomChord.forEach(function(_arg, index) {
              var modifier, note;
              note = _arg.note, modifier = _arg.modifier;
              if (modifier) {
                staveChord.addAccidental(index, new Vex.Flow.Accidental(modifier));
              }
              return staveChord;
            });
            return staveChord;
          };
        })(this));
        return generatedChords;
      };

      return MainView;

    })(Backbone.Marionette.ItemView);
  });

}).call(this);
