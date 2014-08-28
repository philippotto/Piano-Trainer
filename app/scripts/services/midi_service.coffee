### define
./key_converter : KeyConverter
###

class MidiService

  constructor : (@successCallback) ->

    @keyConverter = new KeyConverter()
    @promise = navigator.requestMIDIAccess({sysexEnabled: true})
    @promise.then(
      @onMidiAccess.bind(@)
      console.warn.bind(console)
    )

    @initializeInputStates()


  initializeInputStates : ->

    # an inputState looks like this
    # {
    #   21 : false
    #   ...
    #   108 : true
    # }

    @currentInputState = {}
    @desiredInputState = {}


  setDesiredKeys : (keys) ->

    @desiredInputState = {}

    keys.map((key) =>
     number = @keyConverter.getNumberForKeyString(key)
     @desiredInputState[number] = true
    )


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
      console.error("No connected devices :(")
      return

    # TODO: take care of multiple inputs
    input = inputs[0]
    console.log("Input",  input)
    input.onmidimessage = @onMidiMessage.bind(@)


  onMidiMessage : (msg) ->

    if msg.data.length == 1 and msg.data[0] == 254
      return

    unknown = msg.data[0]

    note = msg.data[1]
    intensity = msg.data[2]

    @setNote(note, intensity)

