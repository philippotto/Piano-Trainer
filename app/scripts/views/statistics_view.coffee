### define
jquery : $
backbone : Backbone
services/statistic_service : StatisticService
services/key_converter : KeyConverter
Chartist : Chartist
###

class StatisticsView extends Backbone.Marionette.ItemView

  className : "row"
  template : _.template """
    <div id="stats">
      <div id="text-stats">
        <h4>The last days you trained:</h4>
        <ul>
          <% statistics.getLastDays(10).map(function(el){ %>
            <li><%= (el.averageTime / 1000).toFixed(2) %>s average
              (<%= (el.totalTime / 1000 / 60).toFixed(2) %> min)
            </li>
          <% }) %>
        </ul>

        <h4>Average time: <%= (statistics.getAverageTimeOfLast(100) / 1000).toFixed(2) %>s</h4>
        <h4>Played chords: <%= statistics.getTotalAmountOfChords() %></h4>
        <h4>Played notes: <%= statistics.getTotalAmountOfNotes() %></h4>
        <h4>Failure rate: <%= statistics.getFailureRate().toFixed(2) %></h4>
      </div>

      <div id="graph-stats">
        <div class="semi-transparent ct-chart ct-perfect-fourth"></div>
      </div>
    </div>
  """

  ui :
    "stats" : "#stats"
    "chart" : ".ct-chart"


  onBeforeRender : ->

    @model = new Backbone.Model()
    @model.set("statistics", @options.statisticService)


  renderChart : ->
    # TODO: find a better way to trigger the rendering

    statistics = @model.get("statistics")

    data =
      labels: []
      series: [
        statistics.getLastTimes(100)
      ]

    options =
      showPoint : false
      lineSmooth : false
      axisX :
        showGrid: false
        showLabel: false
      width: 400
      height: 300

    if (statistics.getSuccessCount() > 1)
      Chartist.Line(@ui.chart.get(0), data, options)
      @ui.stats.show()
    else
      @ui.stats.hide()
