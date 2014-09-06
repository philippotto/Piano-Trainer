### define
jquery : $
backbone : Backbone
lib/uber_router : UberRouter
./views/main_view : MainView
###

class Router extends UberRouter

  rootSelector : "#main"
  navbarSelector : "#navbar"

  routes :
    "" : "home"
    "Piano-Trainer/" : "home"

  whitelist : []

  home : ->

    view = new MainView()
    @changeView(view)

