### define
../services/midi_service : MidiService
lodash : _
###

describe("MidiService", ->

  onKeyStatus = MidiService.onKeyStatus
  offKeyStatus = MidiService.offKeyStatus

  it("notifies about a simple desired key state (midi implementation 1)", ->

    [successCounter, failedCounter] = [0, 0]
    successCallback = -> successCounter++
    failureCallback = -> failedCounter++

    midiService = new MidiService(successCallback, failureCallback, null, null, true)
    midiService.setDesiredKeys(["a/0"])

    # onKeyStatus is an on event
    midiService.onMidiMessage(
      data : [onKeyStatus, 21, 1]
    )

    # 143 is an off event
    midiService.onMidiMessage(
      data : [offKeyStatus, 21, 1]
    )

    expect(failedCounter).toBe(0)
    expect(successCounter).toBe(1)

  )

  it("notifies about a simple desired key state (midi implementation 2)", ->

    [successCounter, failedCounter] = [0, 0]
    successCallback = -> successCounter++
    failureCallback = -> failedCounter++

    midiService = new MidiService(successCallback, failureCallback, null, null, true)
    midiService.setDesiredKeys(["a/0"])

    # send on event
    midiService.onMidiMessage(
      data : [onKeyStatus, 21, 1]
    )

    # send another on event but set velocity to 0
    midiService.onMidiMessage(
      data : [onKeyStatus, 21, 0]
    )

    expect(failedCounter).toBe(0)
    expect(successCounter).toBe(1)

  )

  it("notifies about a complex desired key state", ->

    [successCounter, failedCounter] = [0, 0]
    successCallback = -> successCounter++
    failureCallback = -> failedCounter++

    midiService = new MidiService(successCallback, failureCallback, null, null, true)
    midiService.setDesiredKeys(["a/0", "c/8"])

    midiService.onMidiMessage(
      data : [onKeyStatus, 21, 1]
    )

    midiService.onMidiMessage(
      data : [onKeyStatus, 108, 1]
    )

    midiService.onMidiMessage(
      data : [onKeyStatus, 108, 0]
    )

    expect(successCounter).toBe(1)
    expect(failedCounter).toBe(0)
  )

  it("notifies once about a wrong desired key state", ->

    [successCounter, failedCounter] = [0, 0]
    successCallback = -> successCounter++
    failureCallback = -> failedCounter++

    midiService = new MidiService(successCallback, failureCallback, null, null, true)
    midiService.setDesiredKeys(["a/0", "c/8"])

    midiService.onMidiMessage(data : [onKeyStatus, 21, 1])
    midiService.onMidiMessage(data : [onKeyStatus, 107, 1])

    midiService.onMidiMessage(data : [onKeyStatus, 21, 0])
    midiService.onMidiMessage(data : [onKeyStatus, 107, 0])

    expect(failedCounter).toBe(1)
    expect(successCounter).toBe(0)

  )

)
