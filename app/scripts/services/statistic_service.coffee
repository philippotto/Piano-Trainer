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

  getSuccessCount : ->

    _(@stats)
      .filter((el) -> el.success)
      .value()
      .length


  getLastTimes : (n = 10) ->

    _(@stats)
      .filter((el) -> el.success)
      .pluck("time")
      .last(n)
      .value()


  computeSum : (array) ->

    _.reduce(
      array
      (a, b) -> a + b
      0
    )


  computeAverage : (array) ->

    @computeSum(array) / (array.length || 1)


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

    _(@stats)
      .filter((el) -> el.success)
      .map((el) ->
        el.formattedDate = [
          el.date.getUTCFullYear()
          ("0" + el.date.getMonth()).slice(-2)
          ("0" + el.date.getDate()).slice(-2)
        ].join("-")
        el
      )
      .groupBy("formattedDate")
      .map((aDay, formattedDate) =>
        dayTimes = _.pluck(aDay, "time")
        aDay.averageTime = @computeAverage(dayTimes)
        aDay.totalTime = @computeSum(dayTimes)
        aDay.formattedDate = formattedDate
        aDay
      )
      .sortBy("formattedDate")
      .reverse()
      .value()


  getDataCount : ->

    @stats.length

