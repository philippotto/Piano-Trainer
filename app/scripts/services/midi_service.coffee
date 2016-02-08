### define
./key_converter : KeyConverter
###

class MidiService

  @onKeyStatus = 159
  @offKeyStatus = 143
  @activeSensingStatus = 254

  constructor : (@successCallback, @failureCallback, @errorCallback, @errorResolveCallback, @addInputDevicesCallback, mocked = false) ->

    @errorCallback ||= ->
    @errorResolveCallback ||= ->

    @receivingMidiMessages = false
    @keyConverter = new KeyConverter()
    @initializeInputStates()

    # a wrong chord should not result in lots of failure calls
    # so, remember the last state
    @justHadSuccess = true
    @errorCallbackFired = false

    @activeInputDevice = null

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


  setSelectedInputDeviceById : (deviceId) ->
    inputs = @midi.inputs
    if inputs.size == 0
      @errorCallback("No MIDI device found.")
      return

    myInputs = @inputMapToArray(inputs)
    inputDevice = _.find(myInputs, (input) -> input.id == deviceId)
    @setSelectedInputDevice(inputDevice)


  setSelectedInputDevice : (inputDevice) ->
    console.log("Old input", @activeInputDevice, "New input:", inputDevice)

    if @activeInputDevice
      @activeInputDevice.onmidimessage = null;

    if inputDevice
      @errorResolveCallback()
      @activeInputDevice = inputDevice
      inputDevice.onmidimessage = @onMidiMessage.bind(@)
    else
      @errorCallback("Selected MIDI device is not found.")

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


  # that map needs weird handling, so just converting to an array
  inputMapToArray : (inputs) ->
    midiInputMap = inputs.values();
    midiInput = midiInputMap.next()
    myInputs = []
    while midiInput and !midiInput.done
      input = midiInput.value
      myInputs.push(input)
      midiInput = midiInputMap.next()
    return myInputs

  onMidiAccess : (@midi) ->

    inputs = @midi.inputs
    if inputs.size == 0
      @errorCallback("No MIDI device found.")
      return

    myInputs = @inputMapToArray(inputs)
    @addInputDevicesCallback(myInputs)

    # TODO: take care of multiple inputs
    # weird workaround because inputs.get(0) doesn't always work?
    input = inputs.values().next().value
    console.log("Midi access received. Available inputs", inputs, "Chosen input:", input)
    @setSelectedInputDevice(input)

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

    [status, note, intensity] = msg.data

    if status == MidiService.activeSensingStatus
      # ignore "active sensing" event
      return

    console.log(msg)

    if status <= MidiService.offKeyStatus
      # off event
      intensity = 0

    if status <= MidiService.onKeyStatus
      # on or off event
      @setNote(note, intensity)

