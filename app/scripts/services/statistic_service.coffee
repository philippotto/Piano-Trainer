### define
###

class StatisticService

  constructor : ->

    @stats = localStorage.getItem("pianoTrainerStatistics")
    if @stats
      @stats = JSON.parse(@stats)
    else
      @stats = []

  register : (evt) ->

    ###
    an event could like
    {
      success : true
      keys : ["c#/4", "d#/4"]
      time : 0.5
    }
    ###

    event.date = new Date()

    @stats.push(evt)
    localStorage.setItem("pianoTrainerStatistics", JSON.stringify(@stats))
