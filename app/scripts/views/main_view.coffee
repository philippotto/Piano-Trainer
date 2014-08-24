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

    @renderStave()

    ms = new MidiService()




  renderStave : ->

    renderer = new Vex.Flow.Renderer(@ui.canvas.get(0), Vex.Flow.Renderer.Backends.CANVAS)
    ctx = renderer.getContext()

    stave = new Vex.Flow.Stave(10, 0, 500)
    stave.addClef("treble").setContext(ctx).draw()

    withModifiers = false
    baseModifiers = if withModifiers then ["", "b", "#"] else [""]
    baseNotes = "cdfgab".split("")

    generatedNotes = _.range(0, 4).map((i) ->

      generateRandomKey = ->
        [note, modifier] = [baseNotes, baseModifiers].map(_.sample)
        {note, modifier}

      randomKeys = _.times(_.random(1, 3), generateRandomKey)

      formattedKeys = randomKeys.map( ({note, modifier}) -> note + modifier + "/4" )

      staveNote = new Vex.Flow.StaveNote(
        keys : formattedKeys
        duration: "4"
      )

      randomKeys.map( ({note, modifier}, index) ->
        if modifier
          taveNote.addAccidental(index, new Vex.Flow.Accidental(modifier))
      )

      staveNote
    )

    Vex.Flow.Formatter.FormatAndDraw(ctx, stave, generatedNotes)
