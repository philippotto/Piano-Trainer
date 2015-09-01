(function() {
  define(["../services/midi_service", "lodash"], function(MidiService, _) {
    return describe("MidiService", function() {
      it("notifies about a simple desired key state", function() {
        var failedCounter, failureCallback, midiService, successCallback, successCounter, _ref;
        _ref = [0, 0], successCounter = _ref[0], failedCounter = _ref[1];
        successCallback = function() {
          return successCounter++;
        };
        failureCallback = function() {
          return failedCounter++;
        };
        midiService = new MidiService(successCallback, failureCallback, null, true);
        midiService.setDesiredKeys(["a/0"]);
        midiService.onMidiMessage({
          data: [0, 21, 1]
        });
        midiService.onMidiMessage({
          data: [0, 21, 0]
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
        midiService = new MidiService(successCallback, failureCallback, null, true);
        midiService.setDesiredKeys(["a/0", "c/8"]);
        midiService.onMidiMessage({
          data: [0, 21, 1]
        });
        midiService.onMidiMessage({
          data: [0, 108, 1]
        });
        midiService.onMidiMessage({
          data: [0, 108, 0]
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
        midiService = new MidiService(successCallback, failureCallback, null, true);
        midiService.setDesiredKeys(["a/0", "c/8"]);
        midiService.onMidiMessage({
          data: [0, 21, 1]
        });
        midiService.onMidiMessage({
          data: [0, 107, 1]
        });
        midiService.onMidiMessage({
          data: [0, 21, 0]
        });
        midiService.onMidiMessage({
          data: [0, 107, 0]
        });
        expect(failedCounter).toBe(1);
        return expect(successCounter).toBe(0);
      });
    });
  });

}).call(this);
