### define
###

class StatisticService

  constructor : ->

    @read()
    console.log("@stats",  @stats)

  register : (evt) ->

    ###
    an event could like
    {
      success : true
      keys : ["c#/4", "d#/4"]
      time : 0.5
    }
    ###

    evt.date = new Date()

    @stats.push(evt)
    @save()

  read : ->

    @stats = localStorage.getItem("pianoTrainerStatistics")
    if @stats
      @stats = JSON.parse(@stats)
      for el in @stats
        el.date = new Date(el.date)
    else
      @stats = []



  save : ->

    localStorage.setItem("pianoTrainerStatistics", JSON.stringify(@stats))


  getLastTimes : (n = 10) ->

    _(@stats)
      .filter((el) -> el.success)
      .pluck("time")
      .filter((t) -> t < 15000)
      .last(n)
      .value()


  computeAverage : (array) ->

    sum = _.reduce(
      array
      (a, b) -> a + b
      0
    )

    sum / array.length


  getAverageTimeOfLast : (n = 10) ->

    @computeAverage(@getLastTimes(n))


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


  getLastDays : (n = 10) ->

    res = _(@stats)
      .filter((el) -> el.success and el.time < 15000)
      .groupBy((el) ->
        [
          el.date.getUTCFullYear()
          el.date.getMonth()
          el.date.getDay()
        ].join("-")
      )
      .map((aDay) =>
        @computeAverage(_.pluck(aDay, "time"))
      )
      .value()

    console.log("res",  res)
    return res
