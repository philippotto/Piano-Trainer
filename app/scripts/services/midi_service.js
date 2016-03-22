import KeyConverter from "../services/key_converter.js";
import _ from "lodash";

export default class MidiService {

  constructor(successCallback, failureCallback, errorCallback, errorResolveCallback, mocked = false) {
    this.successCallback = successCallback;
    this.failureCallback = failureCallback;
    this.errorCallback = errorCallback || (() => {});
    this.errorResolveCallback = errorResolveCallback || (() => {});

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
      this.errorCallback("Your browser doesn't seem to support MIDI Access.");
      return;
    }


    this.promise = navigator.requestMIDIAccess({sysexEnabled: true});
    this.promise.then(
      this.onMidiAccess.bind(this),
      () => {
        this.errorCallback("There was a problem while requesting MIDI access.", arguments);
      }
    );

    const debugMode = true;
    if (debugMode) {
      document.addEventListener("keyup", (event) => {
        const trueKeyCode = 84;
        const falseKeyCode = 70;
        if (event.keyCode === trueKeyCode) {
          this.successCallback();
        } else if (event.keyCode === falseKeyCode) {
          this.failureCallback();
        }
      });
    }

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
    let inputs = midi.inputs;
    if (inputs.size === 0) {
      this.errorCallback("No MIDI device found.");
      return;
    }

    // TODO: take care of multiple inputs
    // weird workaround because inputs.get(0) doesn't always work?
    let input = inputs.values().next().value;

    console.log("Midi access received. Available inputs", inputs, "Chosen input:", input);
    input.onmidimessage = this.onMidiMessage.bind(this);

    setTimeout(
      () => {
        if (this.receivingMidiMessages) {
          console.log("Receiving events...");
        } else {
          console.warn("Firing error callback");
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
