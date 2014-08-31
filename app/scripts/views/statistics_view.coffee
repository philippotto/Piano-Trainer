### define
jquery : $
backbone : Backbone
services/statistic_service : StatisticService
services/key_converter : KeyConverter
###

class StatisticsView extends Backbone.Marionette.ItemView


  template : _.template """
    <div class="pull-left">
      <h4>The last 10 chords took you:</h4>
      <ul>
        <% statistics.getLastTenTimes().map(function(el){ %>
          <li><%= (el / 1000).toFixed(2) %> s</li>
        <% }) %>
      </ul>
    </div>

    <div class="pull-right">
      <h4>Average time: </h4> <%= (statistics.getAverageTimeOfLast(100) / 1000).toFixed(2) %> s
      <h4>Total amount of played chords: </h4> <%= statistics.getTotalAmountOfChords() %>
      <h4>Total amount of played notes: </h4> <%= statistics.getTotalAmountOfNotes() %>
    </div>
  """

  ui :
    "canvas" : "canvas"


  onBeforeRender : ->

    @model = new Backbone.Model()
    @model.set("statistics", @options.statisticService)
