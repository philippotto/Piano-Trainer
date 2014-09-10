### define
./key_converter : KeyConverter
###

class MidiService

  constructor : (@successCallback, @failureCallback, @errorCallback, mocked = false) ->

    unless @errorCallback
      @errorCallback = ->


    @keyConverter = new KeyConverter()
    @initializeInputStates()

    # a wrong chord should not result in lots of failure calls
    # so, remember the last state
    @justHadSuccess = true

    if mocked
      return

    unless navigator.requestMIDIAccess?
      @errorCallback("Your browser doesn't seem to support Midi Access.")
      return


    @promise = navigator.requestMIDIAccess({sysexEnabled: true})
    @promise.then(
      @onMidiAccess.bind(@)
      =>
        @errorCallback("There was a problem while requesting MIDI access.", arguments)
    )



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


    @checkEqual(intensity)


  checkEqual: (intensity) ->

    if _.isEqual(@currentInputState, @desiredInputState)
      @justHadSuccess = true
      @successCallback()
      return

    if intensity == 0
      # lifting a key shouldn't result in a failure
      return

    for number, state of @currentInputState
      if state and not @desiredInputState[number]
        if @justHadSuccess
          @justHadSuccess = false
          @failureCallback()
        return



  onMidiAccess : (@midi) ->

    inputs = @midi.inputs()
    if inputs.length == 0
      @errorCallback("No MIDI device found.")
      return

    # TODO: take care of multiple inputs
    input = inputs[0]
    console.log("Input", input)
    input.onmidimessage = @onMidiMessage.bind(@)


  onMidiMessage : (msg) ->

    if msg.data.length == 1 and msg.data[0] == 254
      return

    note = msg.data[1]
    intensity = msg.data[2]

    @setNote(note, intensity)

