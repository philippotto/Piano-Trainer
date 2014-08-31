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
    <div class="col-md-3">
      <h4>The last 10 chords:</h4>
      <ul>
        <% statistics.getLastTimes(10).map(function(el){ %>
          <li><%= (el / 1000).toFixed(2) %> s</li>
        <% }) %>
      </ul>
    </div>

    <div class="col-md-6">
      <div class="semi-transparent ct-chart ct-perfect-fourth"></div>
    </div>

    <div class="col-md-3">
      <h4>Average time: <%= (statistics.getAverageTimeOfLast(100) / 1000).toFixed(2) %> s</h4>
      <h4>Played chords: <%= statistics.getTotalAmountOfChords() %></h4>
      <h4>Played notes: <%= statistics.getTotalAmountOfNotes() %></h4>
      <h4>Failure rate: <%= statistics.getFailureRate().toFixed(2) %></h4>
    </div>

  """

  ui :
    "canvas" : "canvas"
    "chart" : ".ct-chart"


  onBeforeRender : ->

    @model = new Backbone.Model()
    @model.set("statistics", @options.statisticService)


  renderChart : ->

    # TODO: find a better way to trigger the rendering

    data =
      labels: []
      series: [
        @model.get("statistics").getLastTimes(100)
      ]

    options =
      showPoint : false
      lineSmooth : false
      axisX :
        showGrid: false
        showLabel: false

    Chartist.Line(@ui.chart.get(0), data, options)
