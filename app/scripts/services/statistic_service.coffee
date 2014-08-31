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


  getLastTimes : (n = 10) ->

    _(@stats)
      .filter((el) -> el.success)
      .pluck("time")
      .filter((t) -> t < 15000)
      .last(n)
      .value()


  getAverageTimeOfLast : (n = 10) ->

    times = @getLastTimes(n)
    sum = _.reduce(
      times
      (a, b) -> a + b
      0
    )

    sum / times.length


  getTotalAmountOfChords : ->

    _(@stats)
      .filter((el) -> el.success)
      .pluck("keys")
      .size()


  getTotalAmountOfNotes : ->

    _(@stats)
      .filter((el) -> el.success)
      .pluck("keys")
      .flatten()
      .size()

  getFailureRate : ->

    _.filter(@stats, (el) -> el.success).length / @stats.length

