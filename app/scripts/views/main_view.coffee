### define
jquery : $
backbone : Backbone
lib/uber_router : UberRouter
vexflow : Vex
services/midi_service : MidiService
###

class MainView extends Backbone.Marionette.ItemView


  template : _.template """
    <canvas width=700 height=700"></canvas>
  """

  ui :
    "canvas" : "canvas"


  onRender : ->

    @midiService = new MidiService(=>
      @onSuccess()
    )
    @initializeRenderer()
    @renderStave()


  onSuccess : ->

    console.log("success :)")
    @currentNoteIndex++
    @renderStave()


  initializeRenderer : ->

    @renderer = new Vex.Flow.Renderer(@ui.canvas.get(0), Vex.Flow.Renderer.Backends.CANVAS)
    @ctx = @renderer.getContext()


  renderStave : ->

    [renderer, ctx] = [@renderer, @ctx]

    ctx.clear()

    stave = new Vex.Flow.Stave(10, 0, 500)
    stave.addClef("treble").setContext(ctx).draw()

    if not @currentNotes or @currentNoteIndex >= @currentNotes.length
      console.log("generating new notes bitch")
      @currentNotes = @generateNotes()


    @colorizeKeys()

    Vex.Flow.Formatter.FormatAndDraw(ctx, stave, @currentNotes)
    @midiService.setDesiredKeys(@currentNotes[@currentNoteIndex].getKeys())


  colorizeKeys : ->

    @currentNotes.forEach((staveNote, index) =>
      color = if index < @currentNoteIndex then "green" else "black"
      for index in [0...staveNote.getKeys().length]
        staveNote.setKeyStyle(index, fillStyle: color)
    )

  getBaseNotes : ->

    return "cdfgab".split("")


  generateNotes : ->

    @currentNoteIndex = 0

    notesPerBeat = 4
    maximumKeysPerNote = 3
    withModifiers = false
    baseModifiers = if withModifiers then ["", "b", "#"] else [""]

    generatedNotes = _.range(0, notesPerBeat).map((i) =>

      baseNotes = @getBaseNotes()

      generateRandomKey = ->
        noteIndex = _.random(0, baseNotes.length - 1)
        note = baseNotes.splice(noteIndex, 1)[0]

        modifier = _.sample(baseModifiers)
        console.log("{note, modifier}",  {note, modifier})
        {note, modifier}

      randomKeys = _.times(_.random(1, maximumKeysPerNote), generateRandomKey)

      formattedKeys = randomKeys.map( ({note, modifier}) -> note + modifier + "/4" )

      staveNote = new Vex.Flow.StaveNote(
        keys : formattedKeys
        duration: "#{notesPerBeat}"
      )
      console.log("stavenote",  staveNote)


      randomKeys.forEach( ({note, modifier}, index) =>

        if modifier
          staveNote.addAccidental(index, new Vex.Flow.Accidental(modifier))

        return staveNote
      )

      staveNote
    )

    return generatedNotes
