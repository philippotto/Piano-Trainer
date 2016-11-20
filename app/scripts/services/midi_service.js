import AnalyticsService from "../services/analytics_service.js";
import Freezer from "freezer-js";
import AppFreezer from "../AppFreezer.js";
import KeyConverter from "../services/key_converter.js";
import _ from "lodash";

function getMidiSettings() {
  return AppFreezer.get().settings.pitchReading.midi;
}

export default class MidiService {

  constructor(opts) {
    const {
      successCallback,
      failureCallback,
      errorCallback,
      errorResolveCallback,
      mocked,
    } = opts;

    this.successCallback = successCallback;
    this.failureCallback = failureCallback;
    this.errorCallback = errorCallback || _.noop;
    this.errorResolveCallback = errorResolveCallback || _.noop;

    this.receivingMidiMessages = false;
    this.initializeInputStates();

    // a wrong chord should not result in lots of failure calls
    // so, remember the last state
    this.justHadSuccess = true;
    this.errorCallbackFired = false;

    if (mocked) {
      return;
    }

    if (!navigator.requestMIDIAccess) {
      AnalyticsService.sendEvent('MidiService', "no-browser-support");
      this.errorCallback("Your browser doesn't seem to support MIDI Access.");
      return;
    }


    this.promise = navigator.requestMIDIAccess({sysexEnabled: true});
    this.promise.then(
      this.onMidiAccess.bind(this),
      () => {
        AnalyticsService.sendEvent('MidiService', "problem-requesting-midi");
        this.errorCallback("There was a problem while requesting MIDI access.", arguments);
      }
    );
  }

  initializeInputStates() {
    // an inputState looks like this
    // {
    //   21 : false
    //   ...
    //   108 : true
    // }

    this.currentInputState = {};
    this.desiredInputState = {};
  }


  setDesiredKeys(keys, keySignature) {
    this.desiredInputState = {};

    keys.map((key) => {
      const number = KeyConverter.getKeyNumberForKeyString(key, keySignature);
      this.desiredInputState[number] = true;
    });
  }

  setKeyNumber(keyNumber, intensity) {
    if (intensity === 0) {
      delete this.currentInputState[keyNumber];
    } else {
      this.currentInputState[keyNumber] = true;
    }

    this.checkEqual(intensity);
  }


  checkEqual(intensity) {
    if (_.isEqual(this.currentInputState, this.desiredInputState)) {
      this.justHadSuccess = true;
      this.successCallback();
      return;
    }

    if (intensity === 0) {
      // lifting a key shouldn't result in a failure
      return;
    }

    for (const number in this.currentInputState) {
      if (this.currentInputState.hasOwnProperty(number)) {
        const state = this.currentInputState[number];
        if (state && !this.desiredInputState[number]) {
          if (this.justHadSuccess) {
            this.justHadSuccess = false;
            this.failureCallback();
          }
          return;
        }
      }
    }
  }

  onMidiAccess(midi) {
    const inputValues = midi.inputs.values();
    const inputs = [];
    for (let input = inputValues.next(); input && !input.done; input = inputValues.next()) {
      inputs.push(input.value);
    }
    if (inputs.length === 0) {
      AnalyticsService.sendEvent('MidiService', "no-midi-device-found");
      this.errorCallback("No MIDI device found.");
      return;
    }
    let input = inputs[0];
    this.listenToInput(input);

    getMidiSettings().set({
      inputs: Freezer.createLeaf(inputs),
      activeInputIndex: 0,
    });

    AppFreezer.on('input:changed', (newIndex) => {
      const midiSettings = getMidiSettings();
      midiSettings.set({
        activeInputIndex: newIndex,
      });
      this.unlistenToInputs(midiSettings.inputs.get());
      this.listenToInput(midiSettings.inputs.get()[newIndex]);
    })

    console.log("Midi access received. Available inputs", inputs, "Chosen input:", input);
    AnalyticsService.sendEvent('MidiService', "available inputs", inputs.length);
  }

  unlistenToInputs(inputs) {
    inputs.forEach((input) => input.onmidimessage = null);
  }

  listenToInput(input) {
    input.onmidimessage = null;
    input.onmidimessage = this.onMidiMessage.bind(this);

    setTimeout(
      () => {
        if (this.receivingMidiMessages) {
          console.log("Receiving events...");
        } else {
          console.warn("Firing error callback");
          AnalyticsService.sendEvent('MidiService', "no-messages");
          this.errorCallback(`
            A MIDI device could be found, but it doesn't send any messages.
            Did you press a key, yet? A browser restart could help.
          `);
          this.errorCallbackFired = true;
        }
      }, 2000
    );
  }

  onMidiMessage(msg) {
    this.receivingMidiMessages = true;

    if (this.errorCallbackFired) {
      this.errorResolveCallback();
    }

    let [status, keyNumber, intensity] = msg.data;

    if (status === MidiService.activeSensingStatus) {
      // ignore "active sensing" event
      return;
    }

    console.log(msg);

    if (status <= MidiService.offKeyStatus) {
      // off event
      intensity = 0;
    }

    if (status <= MidiService.onKeyStatus) {
      // on or off event
      this.setKeyNumber(keyNumber, intensity);
    }
  }
}

// todo: extract to constants or sth similar
MidiService.onKeyStatus = 159;
MidiService.offKeyStatus = 143;
MidiService.activeSensingStatus = 254;
