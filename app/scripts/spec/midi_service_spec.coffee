### define
../services/midi_service : MidiService
lodash : _
###

describe("MidiService", ->


  it("notifies about a simple desired key state", ->

    [successCounter, failedCounter] = [0, 0]
    successCallback = -> successCounter++
    failureCallback = -> failedCounter++

    midiService = new MidiService(successCallback, failureCallback, null, null, true)
    midiService.setDesiredKeys(["a/0"])

    midiService.onMidiMessage(
      data : [0, 21, 1]
    )

    midiService.onMidiMessage(
      data : [0, 21, 0]
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
      data : [0, 21, 1]
    )

    midiService.onMidiMessage(
      data : [0, 108, 1]
    )

    midiService.onMidiMessage(
      data : [0, 108, 0]
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

    midiService.onMidiMessage(data : [0, 21, 1])
    midiService.onMidiMessage(data : [0, 107, 1])

    midiService.onMidiMessage(data : [0, 21, 0])
    midiService.onMidiMessage(data : [0, 107, 0])

    expect(failedCounter).toBe(1)
    expect(successCounter).toBe(0)

  )

)
