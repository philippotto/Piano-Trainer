### define
###

class MidiService

  constructor : ->

    @promise = navigator.requestMIDIAccess({sysexEnabled: true})
    @promise.then(
      @onMidiAccess.bind(@)
      console.warn.bind(console)
    )

    @currentInputState = {
      # 21 : false
      # ...
      # 108 : false
    }

  generatekeyMapping : ->

    baseScale = [
      "c"
      "c#"
      "d"
      "d#"
      "e"
      "f"
      "f#"
      "g"
      "g#"
      "a"
      "a#"
      "h"
    ]

    # a
    claviature = []


    # c


  setDesiredInputState : ->


  setNote : (note, intensity) ->

    if intensity == 0
      delete @currentInputState[note]
      return

    @currentInputState[note] = true


  onMidiAccess : (@midi) ->

    console.log("successful")

    inputs = @midi.inputs()
    if inputs.length == 0
      console.error("no inputs!")
      return

    input = inputs[0]
    console.log("input",  input)
    input.onmidimessage = @onMidiMessage.bind(@)


  onMidiMessage : (msg) ->

    if msg.data.length == 1 and msg.data[0] == 254
      return

    unknown = msg.data[0]

    # between 21 and 108
    note = msg.data[1]
    intensity = msg.data[2]

    @setNote(note, intensity)

    console.log("@currentInputState",  @currentInputState)
