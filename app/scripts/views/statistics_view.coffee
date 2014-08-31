### define
jquery : $
backbone : Backbone
services/statistic_service : StatisticService
services/key_converter : KeyConverter
###

class StatisticsView extends Backbone.Marionette.ItemView


  template : _.template """
    <div class="pull-left">
      <h4>The last 10 chords:</h4>
      <ul>
        <% statistics.getLastTenTimes().map(function(el){ %>
          <li><%= (el / 1000).toFixed(2) %> s</li>
        <% }) %>
      </ul>
    </div>

    <div class="pull-right">
      <h4>Average time: <%= (statistics.getAverageTimeOfLast(100) / 1000).toFixed(2) %> s</h4>
      <h4>Played chords: <%= statistics.getTotalAmountOfChords() %></h4>
      <h4>Played notes: <%= statistics.getTotalAmountOfNotes() %></h4>
      <h4>Failure rate: <%= statistics.getFailureRate().toFixed(2) %></h4>


    </div>
  """

  ui :
    "canvas" : "canvas"


  onBeforeRender : ->

    @model = new Backbone.Model()
    @model.set("statistics", @options.statisticService)
