### define
###

class MidiService

  constructor : (@successCallback) ->

    @promise = navigator.requestMIDIAccess({sysexEnabled: true})
    @promise.then(
      @onMidiAccess.bind(@)
      console.warn.bind(console)
    )

    @initializeInputStates()
    @initializeKeyMap()


  initializeInputStates : ->

    # inputState will look like this
    # {
    #   21 : false
    #   ...
    #   108 : false
    # }

    @currentInputState = {}
    @desiredInputState = {}


  initializeKeyMap : ->

    # builds a keyMap which looks like this
    # {
    #   21 : "a0"
    #   22 : "a#0"
    #   ...
    #   108 : "c8"
    # }


    baseScale = [
      "c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"
    ]

    claviature = baseScale
      .slice(-3)
      .concat(_.flatten(_.times(7, -> baseScale)))
      .concat([baseScale[0]])


    keyMap = {}

    for key, index in claviature
      offsettedIndex = index - 3
      nr = Math.floor((offsettedIndex + 12) / 12)

      keyMap[index + 21] = key + "/" + nr

    @keyMap = keyMap


  getNumberForKeyString : (keyString) ->

    _.findKey(@keyMap, (key) -> key == keyString)


  setDesiredKeys : (keys) ->

    # clear state
    @desiredInputState = {}

    keys.map((key) =>
     number = @getNumberForKeyString(key)
     @desiredInputState[number] = true
    )

    console.log("desiredInputState",  @desiredInputState)


  setNote : (note, intensity) ->

    if intensity == 0
      delete @currentInputState[note]
    else
      @currentInputState[note] = true


    @checkEqual()

  checkEqual: ->

    if _.isEqual(@currentInputState, @desiredInputState)
      @successCallback()


  onMidiAccess : (@midi) ->

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
