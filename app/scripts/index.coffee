define( "app", ["marionette"], (Marionette) -> new Marionette.Application() )

require [
  "jquery"
  "lodash"
  "app"
  "./router"
], ($, _, app, Router) ->

  window.app = app

  app.addInitializer( ->
    app.router = new Router()
  )

  app.on("start", ->
    Backbone.history.start(
      pushState: true
    )
  )

  $ ->
    app.start()
