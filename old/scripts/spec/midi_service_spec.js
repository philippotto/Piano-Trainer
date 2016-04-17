(function() {
  define(["../services/midi_service", "lodash"], function(MidiService, _) {
    return describe("MidiService", function() {
      var offKeyStatus, onKeyStatus;
      onKeyStatus = MidiService.onKeyStatus;
      offKeyStatus = MidiService.offKeyStatus;
      it("notifies about a simple desired key state (midi implementation 1)", function() {
        var failedCounter, failureCallback, midiService, successCallback, successCounter, _ref;
        _ref = [0, 0], successCounter = _ref[0], failedCounter = _ref[1];
        successCallback = function() {
          return successCounter++;
        };
        failureCallback = function() {
          return failedCounter++;
        };
        midiService = new MidiService(successCallback, failureCallback, null, null, true);
        midiService.setDesiredKeys(["a/0"]);
        midiService.onMidiMessage({
          data: [onKeyStatus, 21, 1]
        });
        midiService.onMidiMessage({
          data: [offKeyStatus, 21, 1]
        });
        expect(failedCounter).toBe(0);
        return expect(successCounter).toBe(1);
      });
      it("notifies about a simple desired key state (midi implementation 2)", function() {
        var failedCounter, failureCallback, midiService, successCallback, successCounter, _ref;
        _ref = [0, 0], successCounter = _ref[0], failedCounter = _ref[1];
        successCallback = function() {
          return successCounter++;
        };
        failureCallback = function() {
          return failedCounter++;
        };
        midiService = new MidiService(successCallback, failureCallback, null, null, true);
        midiService.setDesiredKeys(["a/0"]);
        midiService.onMidiMessage({
          data: [onKeyStatus, 21, 1]
        });
        midiService.onMidiMessage({
          data: [onKeyStatus, 21, 0]
        });
        expect(failedCounter).toBe(0);
        return expect(successCounter).toBe(1);
      });
      it("notifies about a complex desired key state", function() {
        var failedCounter, failureCallback, midiService, successCallback, successCounter, _ref;
        _ref = [0, 0], successCounter = _ref[0], failedCounter = _ref[1];
        successCallback = function() {
          return successCounter++;
        };
        failureCallback = function() {
          return failedCounter++;
        };
        midiService = new MidiService(successCallback, failureCallback, null, null, true);
        midiService.setDesiredKeys(["a/0", "c/8"]);
        midiService.onMidiMessage({
          data: [onKeyStatus, 21, 1]
        });
        midiService.onMidiMessage({
          data: [onKeyStatus, 108, 1]
        });
        midiService.onMidiMessage({
          data: [onKeyStatus, 108, 0]
        });
        expect(successCounter).toBe(1);
        return expect(failedCounter).toBe(0);
      });
      return it("notifies once about a wrong desired key state", function() {
        var failedCounter, failureCallback, midiService, successCallback, successCounter, _ref;
        _ref = [0, 0], successCounter = _ref[0], failedCounter = _ref[1];
        successCallback = function() {
          return successCounter++;
        };
        failureCallback = function() {
          return failedCounter++;
        };
        midiService = new MidiService(successCallback, failureCallback, null, null, true);
        midiService.setDesiredKeys(["a/0", "c/8"]);
        midiService.onMidiMessage({
          data: [onKeyStatus, 21, 1]
        });
        midiService.onMidiMessage({
          data: [onKeyStatus, 107, 1]
        });
        midiService.onMidiMessage({
          data: [onKeyStatus, 21, 0]
        });
        midiService.onMidiMessage({
          data: [onKeyStatus, 107, 0]
        });
        expect(failedCounter).toBe(1);
        return expect(successCounter).toBe(0);
      });
    });
  });

}).call(this);
