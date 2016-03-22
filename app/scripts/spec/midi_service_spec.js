import MidiService from "../services/midi_service.js";

describe("MidiService", function () {

  const onKeyStatus = MidiService.onKeyStatus;
  const offKeyStatus = MidiService.offKeyStatus;

  it("notifies about a simple desired key state (midi implementation 1)", function () {

    let [successCounter, failedCounter] = [0, 0];
    const successCallback = () => successCounter++;
    const failureCallback = () => failedCounter++;

    const midiService = new MidiService({ successCallback, failureCallback, mocked: true });
    midiService.setDesiredKeys(["a/0"], "C");

    // onKeyStatus is an on event
    midiService.onMidiMessage(
      {data: [onKeyStatus, 21, 1]}
    );

    // 143 is an off event
    midiService.onMidiMessage(
      {data: [offKeyStatus, 21, 1]}
    );

    expect(failedCounter).toBe(0);
    expect(successCounter).toBe(1);
  });

  it("notifies about a simple desired key state (midi implementation 2)", function () {

    let [successCounter, failedCounter] = [0, 0];
    const successCallback = () => successCounter++;
    const failureCallback = () => failedCounter++;

    const midiService = new MidiService({ successCallback, failureCallback, mocked: true });
    midiService.setDesiredKeys(["a/0"], "C");

    // send on event
    midiService.onMidiMessage(
      {data: [onKeyStatus, 21, 1]}
    );

    // send another on event but set velocity to 0
    midiService.onMidiMessage(
      {data: [onKeyStatus, 21, 0]}
    );

    expect(failedCounter).toBe(0);
    expect(successCounter).toBe(1);
  });

  it("notifies about a complex desired key state", function () {

    let [successCounter, failedCounter] = [0, 0];
    const successCallback = () => successCounter++;
    const failureCallback = () => failedCounter++;

    const midiService = new MidiService({ successCallback, failureCallback, mocked: true });
    midiService.setDesiredKeys(["a/0", "c/8"], "C");

    midiService.onMidiMessage(
      {data: [onKeyStatus, 21, 1]}
    );

    midiService.onMidiMessage(
      {data: [onKeyStatus, 108, 1]}
    );

    midiService.onMidiMessage(
      {data: [onKeyStatus, 108, 0]}
    );

    expect(successCounter).toBe(1);
    expect(failedCounter).toBe(0);
  });

  it("notifies once about a wrong desired key state", function () {

    let [successCounter, failedCounter] = [0, 0];
    const successCallback = () => successCounter++;
    const failureCallback = () => failedCounter++;

    const midiService = new MidiService({ successCallback, failureCallback, mocked: true });
    midiService.setDesiredKeys(["a/0", "c/8"], "C");

    midiService.onMidiMessage({data: [onKeyStatus, 21, 1]});
    midiService.onMidiMessage({data: [onKeyStatus, 107, 1]});

    midiService.onMidiMessage({data: [onKeyStatus, 21, 0]});
    midiService.onMidiMessage({data: [onKeyStatus, 107, 0]});

    expect(failedCounter).toBe(1);
    expect(successCounter).toBe(0);
  });
});
