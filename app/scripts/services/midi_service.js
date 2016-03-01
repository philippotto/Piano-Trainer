// ### define
// ./key_converter : KeyConverter
// ###

export default class MidiService {

  constructor(successCallback, failureCallback, errorCallback, errorResolveCallback, mocked = false) {

    this.successCallback = successCallback
    this.failureCallback = failureCallback
    this.errorCallback = errorCallback || (() => {})
    this.errorResolveCallback = errorResolveCallback || (() => {})

    this.receivingMidiMessages = false
    this.keyConverter = new KeyConverter()
    this.initializeInputStates()

    // a wrong chord should not result in lots of failure calls
    // so, remember the last state
    this.justHadSuccess = true
    this.errorCallbackFired = false

    if (mocked)
      return;

    if (!navigator.requestMIDIAccess) {
      this.errorCallback("Your browser doesn't seem to support MIDI Access.");
      return;
    }


    this.promise = navigator.requestMIDIAccess({sysexEnabled: true});
    this.promise.then(
      this.onMidiAccess.bind(this),
      () => {
        this.errorCallback("There was a problem while requesting MIDI access.", arguments)
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


  setDesiredKeys(keys) {

    this.desiredInputState = {};

    keys.map((key) => {
     number = this.keyConverter.getNumberForKeyString(key);
     this.desiredInputState[number] = true;
    });
  }

  setNote(note, intensity) {

    if (intensity == 0)
      delete this.currentInputState[note];
    else
      this.currentInputState[note] = true;


    this.checkEqual(intensity);
  }


  checkEqual(intensity) {

    if (_.isEqual(this.currentInputState, this.desiredInputState)) {
      this.justHadSuccess = true;
      this.successCallback();
      return;
    }

    if (intensity == 0) {
      // lifting a key shouldn't result in a failure
      return;
    }

    for (const number of this.currentInputState) {
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

  onMidiAccess(midi) {
    this.midi = midi;

    inputs = this.midi.inputs;
    if (inputs.size == 0) {
      this.errorCallback("No MIDI device found.");
      return;
    }

    // TODO: take care of multiple inputs
    // weird workaround because inputs.get(0) doesn't always work?
    input = inputs.values().next().value;

    console.log("Midi access received. Available inputs", inputs, "Chosen input:", input);
    input.onmidimessage = this.onMidiMessage.bind(this);

    setTimeout(
      () => {
        if (this.receivingMidiMessages) {
          console.log("Receiving events...");
        } else {
          console.warn("Firing error callback");
          this.errorCallback("A MIDI device could be found, but it doesn't send any messages. Did you press a key, yet? A browser restart could help.");
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

    [status, note, intensity] = msg.data;

    if (status == MidiService.activeSensingStatus) {
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
      this.setNote(note, intensity);
    }
  }

}

// todo: extract to constants or sth similar
MidiService.onKeyStatus = 159;
MidiService.offKeyStatus = 143;
MidiService.activeSensingStatus = 254;
