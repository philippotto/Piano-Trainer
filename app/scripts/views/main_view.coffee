### define
jquery : $
backbone : Backbone
lib/uber_router : UberRouter
vexflow : Vex
services/midi_service : MidiService
services/statistic_service : StatisticService
###

class MainView extends Backbone.Marionette.ItemView


  template : _.template """
    <div class="Aligner-item">
      <canvas width=700 height=300"></canvas>
    </div>
  """

  className : "Aligner"

  ui :
    "canvas" : "canvas"


  onRender : ->

    @midiService = new MidiService(=>
      @onSuccess()
    )
    @statisticService = new StatisticService()
    @initializeRenderer()
    @renderStave()


  getAllCurrentKeys : ->

    [].concat(
      @currentNotes["treble"][@currentNoteIndex].getKeys()
      @currentNotes["bass"][@currentNoteIndex].getKeys()
    )

  onSuccess : ->

    @statisticService.register(
      success : true
      keys : @getAllCurrentKeys()
      time : new Date() - @startDate
    )

    @currentNoteIndex++
    @renderStave()


  initializeRenderer : ->

    @renderer = new Vex.Flow.Renderer(@ui.canvas.get(0), Vex.Flow.Renderer.Backends.CANVAS)
    @ctx = @renderer.getContext()


  renderStave : ->

    @startDate = new Date()

    [renderer, ctx] = [@renderer, @ctx]

    ctx.clear()

    rightHandStave = new Vex.Flow.Stave(10, 0, 500)
    rightHandStave.addClef("treble").setContext(ctx).draw()

    leftHandStave = new Vex.Flow.Stave(10, 80, 500)
    leftHandStave.addClef("bass").setContext(ctx).draw()

    if not @currentNotes or @currentNoteIndex >= @currentNotes.treble.length
      @currentNotes =
        treble : @generateNotes("treble")
        bass : @generateNotes("bass")

    @colorizeKeys()

    [[rightHandStave, "treble"], [leftHandStave, "bass"]].map ([stave, clef]) =>
      Vex.Flow.Formatter.FormatAndDraw(ctx, stave, @currentNotes[clef])

    @midiService.setDesiredKeys(@getAllCurrentKeys())


  colorizeKeys : ->

    for own key, clef of @currentNotes

      clef.forEach((staveNote, index) =>
        color = if index < @currentNoteIndex then "green" else "black"
        for index in [0...staveNote.getKeys().length]
          staveNote.setKeyStyle(index, fillStyle: color)
      )


  getBaseNotes : ->

    return "cdfgab".split("")


  generateNotes : (clef) ->

    options =
      notesPerBeat : 4
      maximumKeysPerNote : 3
      withModifiers : false
      levels :
        bass : [2, 3]
        treble : [4, 5]
      maximumInterval : 12

    @currentNoteIndex = 0

    baseModifiers = if options.withModifiers then ["", "b", "#"] else [""]

    generatedNotes = _.range(0, options.notesPerBeat).map((i) =>

      baseNotes = @getBaseNotes()

      generateRandomKey = ->

        randomNoteIndex = _.random(0, baseNotes.length - 1)
        note = baseNotes.splice(randomNoteIndex, 1)[0]

        modifier = _.sample(baseModifiers)
        {note, modifier}


      generateRandomKeys = ->

        keys = _.times(_.random(1, options.maximumKeysPerNote), generateRandomKey)


      ensureInterval = (keys) =>

        keyNumbers = keys.map((key) => @midiService.getNumberForKeyString())
        return options.maximumInterval >= _.max(keyNumbers) - _.min(keyNumbers)


      randomKeys = generateRandomKeys()
      while not ensureInterval(randomKeys)
        randomKeys = generateRandomKeys()


      randomLevel = _.sample(options.levels[clef])

      formattedKeys = randomKeys.map(({note, modifier}) ->
        note + modifier + "/" + randomLevel
      )

      staveNote = new Vex.Flow.StaveNote(
        clef : clef
        keys : formattedKeys
        duration: "#{options.notesPerBeat}"
      )

      randomKeys.forEach(({note, modifier}, index) =>
        if modifier
          staveNote.addAccidental(index, new Vex.Flow.Accidental(modifier))

        return staveNote
      )

      staveNote
    )

    return generatedNotes
