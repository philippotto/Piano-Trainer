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


  getLastTenTimes : (n = 10) ->

    _(@stats)
      .pluck("time")
      .filter((t) -> t < 15000)
      .last(n)
      .value()


  getAverageTimeOfLast : (n = 10) ->

    times = @getLastTenTimes(n)
    sum = _.reduce(
      times
      (a, b) -> a + b
      0
    )

    sum / times.length

  getTotalAmountOfChords : ->

    _.pluck(@stats, "keys").length


  getTotalAmountOfNotes : ->

    _(@stats).pluck("keys").flatten().size()
