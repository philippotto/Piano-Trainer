// ### define
// jquery : $
// backbone : Backbone
// lib/uber_router : UberRouter
// ./views/main_view : MainView
// ###

export default class Router extends UberRouter {

  constructor() {
    super();
    this.rootSelector = "#main";
    this.navbarSelector = "#navbar";

    this.routes  = {
      "" : "home",
      "Piano-Trainer/" : "home"
    };

    this.whitelist = [];
  }

  home() {
    var view = new MainView();
    return this.changeView(view);
  }
}

