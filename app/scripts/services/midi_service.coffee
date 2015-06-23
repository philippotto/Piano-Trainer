### define
./key_converter : KeyConverter
###

class MidiService

  constructor : (@successCallback, @failureCallback, @errorCallback, @errorResolveCallback, mocked = false) ->

    @errorCallback ||= ->
    @errorResolveCallback ||= ->

    @receivingMidiMessages = false
    @keyConverter = new KeyConverter()
    @initializeInputStates()

    # a wrong chord should not result in lots of failure calls
    # so, remember the last state
    @justHadSuccess = true
    @errorCallbackFired = false

    if mocked
      return

    unless navigator.requestMIDIAccess?
      @errorCallback("Your browser doesn't seem to support MIDI Access.")
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

    inputs = @midi.inputs
    if inputs.size == 0
      @errorCallback("No MIDI device found.")
      return

    # TODO: take care of multiple inputs
    # weird workaround because inputs.get(0) doesn't always work?
    input = inputs.values().next().value

    console.log("Midi access received. Available inputs", inputs, "Chosen input:", input)
    input.onmidimessage = @onMidiMessage.bind(@)

    setTimeout(
      =>
        if @receivingMidiMessages
          console.log("Receiving events...")
        else
          console.warn("Firing error callback")
          @errorCallback("A MIDI device could be found, but it doesn't send any messages. Did you press a key, yet? A browser restart could help.")
          @errorCallbackFired = true
      2000
    )


  onMidiMessage : (msg) ->

    @receivingMidiMessages = true

    if @errorCallbackFired
      @errorResolveCallback()

    if msg.data[0] == 254
      # ignore "active sensing" event
      return

    console.log(msg)

    note = msg.data[1]
    intensity = msg.data[2]

    @setNote(note, intensity)

