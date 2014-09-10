(function() {
  define(["./key_converter"], function(KeyConverter) {
    var MidiService;
    return MidiService = (function() {
      function MidiService(successCallback, failureCallback, errorCallback, mocked) {
        this.successCallback = successCallback;
        this.failureCallback = failureCallback;
        this.errorCallback = errorCallback;
        if (mocked == null) {
          mocked = false;
        }
        if (!this.errorCallback) {
          this.errorCallback = function() {};
        }
        this.receivingMidiMessages = false;
        this.keyConverter = new KeyConverter();
        this.initializeInputStates();
        this.justHadSuccess = true;
        if (mocked) {
          return;
        }
        if (navigator.requestMIDIAccess == null) {
          this.errorCallback("Your browser doesn't seem to support MIDI Access.");
          return;
        }
        this.promise = navigator.requestMIDIAccess({
          sysexEnabled: true
        });
        this.promise.then(this.onMidiAccess.bind(this), (function(_this) {
          return function() {
            return _this.errorCallback("There was a problem while requesting MIDI access.", arguments);
          };
        })(this));
        setTimeout((function(_this) {
          return function() {
            if (!_this.receivingMidiMessages) {
              return _this.errorCallback("A MIDI device could be found, but it doesn't send any messages. A browser restart may help.");
            }
          };
        })(this), 2000);
      }

      MidiService.prototype.initializeInputStates = function() {
        this.currentInputState = {};
        return this.desiredInputState = {};
      };

      MidiService.prototype.setDesiredKeys = function(keys) {
        this.desiredInputState = {};
        return keys.map((function(_this) {
          return function(key) {
            var number;
            number = _this.keyConverter.getNumberForKeyString(key);
            return _this.desiredInputState[number] = true;
          };
        })(this));
      };

      MidiService.prototype.setNote = function(note, intensity) {
        if (intensity === 0) {
          delete this.currentInputState[note];
        } else {
          this.currentInputState[note] = true;
        }
        return this.checkEqual(intensity);
      };

      MidiService.prototype.checkEqual = function(intensity) {
        var number, state, _ref;
        if (_.isEqual(this.currentInputState, this.desiredInputState)) {
          this.justHadSuccess = true;
          this.successCallback();
          return;
        }
        if (intensity === 0) {
          return;
        }
        _ref = this.currentInputState;
        for (number in _ref) {
          state = _ref[number];
          if (state && !this.desiredInputState[number]) {
            if (this.justHadSuccess) {
              this.justHadSuccess = false;
              this.failureCallback();
            }
            return;
          }
        }
      };

      MidiService.prototype.onMidiAccess = function(midi) {
        var input, inputs;
        this.midi = midi;
        inputs = this.midi.inputs();
        if (inputs.length === 0) {
          this.errorCallback("No MIDI device found.");
          return;
        }
        input = inputs[0];
        console.log("Input", input);
        return input.onmidimessage = this.onMidiMessage.bind(this);
      };

      MidiService.prototype.onMidiMessage = function(msg) {
        var intensity, note;
        this.receivingMidiMessages = true;
        if (msg.data.length === 1 && msg.data[0] === 254) {
          return;
        }
        note = msg.data[1];
        intensity = msg.data[2];
        return this.setNote(note, intensity);
      };

      return MidiService;

    })();
  });

}).call(this);
