### define
jquery : $
backbone : Backbone
lib/uber_router : UberRouter
vexflow : Vex
services/midi_service : MidiService
services/statistic_service : StatisticService
services/key_converter : KeyConverter
###

class MainView extends Backbone.Marionette.ItemView


  template : _.template """
    <div class="Aligner-item">
      <canvas></canvas>
    </div>
  """

  className : "Aligner"

  ui :
    "canvas" : "canvas"


  onRender : ->

    @keyConverter = new KeyConverter()

    @midiService = new MidiService(=>
      @onSuccess()
    )
    @statisticService = new StatisticService()
    @initializeRenderer()
    @renderStave()


  getAllCurrentKeys : ->

    [].concat(
      @currentNotes["treble"][@currentChordIndex].getKeys()
      @currentNotes["bass"][@currentChordIndex].getKeys()
    )

  onSuccess : ->

    @statisticService.register(
      success : true
      keys : @getAllCurrentKeys()
      time : new Date() - @startDate
    )

    @currentChordIndex++
    @renderStave()


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

    [renderer, ctx] = [@renderer, @ctx]

    ctx.clear()

    [width, height] = [500, 500]
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

    return "cdfgab".split("")


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

      baseNotes = @getBaseNotes()
      randomLevel = _.sample(options.levels[clef])

      generateNote = ->

        randomNoteIndex = _.random(0, baseNotes.length - 1)
        note = baseNotes.splice(randomNoteIndex, 1)[0]

        modifier = _.sample(baseModifiers)
        {note, modifier}


      generateChord = ->

        keys = _.times(_.random(1, options.maximumKeysPerChord), generateNote)


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
