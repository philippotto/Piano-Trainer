(function() {
  define(["./key_converter"], function(KeyConverter) {
    var MidiService;
    return MidiService = (function() {
      function MidiService(successCallback, failureCallback, errorCallback, errorResolveCallback, mocked) {
        this.successCallback = successCallback;
        this.failureCallback = failureCallback;
        this.errorCallback = errorCallback;
        this.errorResolveCallback = errorResolveCallback;
        if (mocked == null) {
          mocked = false;
        }
        this.errorCallback || (this.errorCallback = function() {});
        this.errorResolveCallback || (this.errorResolveCallback = function() {});
        this.receivingMidiMessages = false;
        this.keyConverter = new KeyConverter();
        this.initializeInputStates();
        this.justHadSuccess = true;
        this.errorCallbackFired = false;
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
        inputs = this.midi.inputs;
        if (inputs.size === 0) {
          this.errorCallback("No MIDI device found.");
          return;
        }
        input = inputs.values().next().value;
        console.log("Midi access received. Available inputs", inputs, "Chosen input:", input);
        input.onmidimessage = this.onMidiMessage.bind(this);
        return setTimeout((function(_this) {
          return function() {
            if (_this.receivingMidiMessages) {
              return console.log("Receiving events...");
            } else {
              console.warn("Firing error callback");
              _this.errorCallback("A MIDI device could be found, but it doesn't send any messages. Did you press a key, yet? A browser restart could help.");
              return _this.errorCallbackFired = true;
            }
          };
        })(this), 2000);
      };

      MidiService.prototype.onMidiMessage = function(msg) {
        var intensity, note, status, _ref;
        this.receivingMidiMessages = true;
        if (this.errorCallbackFired) {
          this.errorResolveCallback();
        }
        _ref = msg.data, status = _ref[0], note = _ref[1], intensity = _ref[2];
        if (status === 254) {
          return;
        }
        console.log(msg);
        if (status <= 143) {
          intensity = 0;
        }
        if (status <= 159) {
          return this.setNote(note, intensity);
        }
      };

      return MidiService;

    })();
  });

}).call(this);
