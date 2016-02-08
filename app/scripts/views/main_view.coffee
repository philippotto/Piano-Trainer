### define
jquery : $
backbone : Backbone
vexflow : Vex
services/midi_service : MidiService
services/statistic_service : StatisticService
services/key_converter : KeyConverter
./statistics_view : StatisticsView
###

class MainView extends Backbone.Marionette.ItemView


  template : _.template """
    <img id="image-background" src="images/piano-background.jpg">

    <div class="jumbotron">
      <select id="input-devices"></select>

      <h1>Piano Trainer</h1>
      <a href="https://github.com/philippotto/Piano-Trainer">
        <img id="github" src="images/github.png">
      </a>
    </div>

    <div class="too-small">
      <div class="message">
        <p>
          This page is meant to be viewed on a sufficiently large screen with a MIDI enabled device connected.
          If you are interested to learn more about Piano-Trainer, view <a href="http://github.com/philippotto/Piano-Trainer">this page.</a>
        </p>
      </div>
    </div>

    <div class="trainer">
      <div class="Aligner">
        <div class="Aligner-item">
          <canvas></canvas>
        </div>
      </div>

      <div id="message-container" class="Aligner hide">
        <div class="Aligner-item message Aligner">
          <div>
            <h3 id="error-message"></h3>
            <h4>
              Have a look into the <a href="https://github.com/philippotto/Piano-Trainer#how-to-use">Set Up</a> section.
            </h4>
          </div>
        </div>
      </div>

      <div id="statistics"></div>
      <audio id="success-player" hidden="true" src="success.mp3" controls preload="auto" autobuffer></audio>
    </div>
  """


  ui :
    "canvas" : "canvas"
    "statistics" : "#statistics"
    "errorMessage" : "#error-message"
    "messageContainer" : "#message-container"
    "inputDevicesSelect" : "#input-devices"


  onRender : ->

    @statisticService = new StatisticService()
    @statisticsView = new StatisticsView({statisticService : @statisticService})
    @renderStatistics()

    # find a way to remove this dirty work around
    setTimeout(
      => @renderStatistics()
      0
    )


    @keyConverter = new KeyConverter()

    @midiService = new MidiService(
      @onSuccess.bind(@)
      @onFailure.bind(@)
      @onError.bind(@),
      @onErrorResolve.bind(@)
      @onAddInputDevices.bind(@)
    )
    @addViewListeners()
    @initializeRenderer()
    @renderStave()


  onError : (msg, args) ->

    console.error.apply(console, arguments)
    @ui.errorMessage.html(msg)
    @ui.messageContainer.removeClass("hide")


  onErrorResolve : ->

    @ui.messageContainer.addClass("hide")

  onAddInputDevices : (inputDevices) ->
    devices = @ui.inputDevicesSelect

    for inputDevice in inputDevices
      do (inputDevice) ->
        devices.append(new Option(inputDevice.name, inputDevice.id))


  getAllCurrentKeys : ->

    [].concat(
      @currentNotes["treble"][@currentChordIndex].getKeys()
      @currentNotes["bass"][@currentChordIndex].getKeys()
    )


  onSuccess : ->

    event =
      success : true
      keys : @getAllCurrentKeys()
      time : new Date() - @startDate

    timeThreshold = 30000

    if event.time <= timeThreshold
      @statisticService.register(event)
      @onErrorResolve()
    else
      # don't save events which took too long
      # we don't want to drag the statistics down when the user made a break
      @onError("Since you took more than " + timeThreshold/1000 + " seconds, we ignored this event to avoid dragging down your statistics. Hopefully, you just made a break in between :)")

    @currentChordIndex++
    @renderStave()
    @renderStatistics()
    @playSuccessSound()


  playSuccessSound : ->

    document.getElementById('success-player').play()


  onFailure : ->

    @statisticService.register(
      success : false
      keys : @getAllCurrentKeys()
      time : new Date() - @startDate
    )

    @renderStatistics()

  addViewListeners : ->
    midiService = @midiService
    @ui.inputDevicesSelect.change(
      () -> midiService.setSelectedInputDeviceById(this.value)
    )


  renderStatistics : ->

    @ui.statistics.html(@statisticsView.render().el)
    @statisticsView.renderChart()


  initializeRenderer : ->

    @renderer = new Vex.Flow.Renderer(@ui.canvas.get(0), Vex.Flow.Renderer.Backends.CANVAS)
    @ctx = @renderer.getContext()


  setCanvasExtent : (width, height) ->

    canvas = @ui.canvas.get(0)
    canvas.width = width
    canvas.height = height
    canvas.style.width = width
    canvas.style.height = height


  renderStave : ->

    @startDate = new Date()

    [width, height] = [500, 250]
    [renderer, ctx] = [@renderer, @ctx]

    ctx.clear()

    @setCanvasExtent(width, height)

    rightHandStave = new Vex.Flow.Stave(10, 0, width)
    rightHandStave.addClef("treble").setContext(ctx).draw()

    leftHandStave = new Vex.Flow.Stave(10, 80, width)
    leftHandStave.addClef("bass").setContext(ctx).draw()

    if not @currentNotes or @currentChordIndex >= @currentNotes.treble.length
      @currentNotes =
        treble : @generateBar("treble")
        bass : @generateBar("bass")

    @colorizeKeys()

    [[rightHandStave, "treble"], [leftHandStave, "bass"]].map ([stave, clef]) =>
      Vex.Flow.Formatter.FormatAndDraw(ctx, stave, @currentNotes[clef])

    @midiService.setDesiredKeys(@getAllCurrentKeys())


  colorizeKeys : ->

    for own key, clef of @currentNotes

      clef.forEach((staveNote, index) =>
        color = if index < @currentChordIndex then "green" else "black"
        for index in [0...staveNote.getKeys().length]
          staveNote.setKeyStyle(index, fillStyle: color)
      )


  getBaseNotes : ->

    return "cdefgab".split("")


  generateBar : (clef) ->

    options =
      notesPerBar : 4
      maximumKeysPerChord : 3
      withModifiers : false
      levels :
        bass : [2, 3]
        treble : [4, 5]
      maximumInterval : 12

    @currentChordIndex = 0

    baseModifiers = if options.withModifiers then ["", "b", "#"] else [""]

    generatedChords = _.range(0, options.notesPerBar).map( =>

      randomLevel = _.sample(options.levels[clef])

      generateNote = (baseNotes) ->

        randomNoteIndex = _.random(0, baseNotes.length - 1)
        note = baseNotes.splice(randomNoteIndex, 1)[0]

        modifier = _.sample(baseModifiers)
        {note, modifier}


      generateChord = =>

        baseNotes = @getBaseNotes()
        keys = _.times(_.random(1, options.maximumKeysPerChord), ->
          generateNote(baseNotes)
        )


      formatKey = ({note, modifier}) -> note + modifier + "/" + randomLevel


      ensureInterval = (keys) =>

        keyNumbers = keys.map((key) =>
          @keyConverter.getNumberForKeyString(formatKey(key))
        )
        return options.maximumInterval >= _.max(keyNumbers) - _.min(keyNumbers)


      randomChord = generateChord()
      while not ensureInterval(randomChord)
        randomChord = generateChord()


      staveChord = new Vex.Flow.StaveNote(
        clef : clef
        keys : randomChord.map(formatKey)
        duration: "#{options.notesPerBar}"
      )

      randomChord.forEach(({note, modifier}, index) =>
        if modifier
          staveChord.addAccidental(index, new Vex.Flow.Accidental(modifier))

        return staveChord
      )

      staveChord
    )

    return generatedChords
