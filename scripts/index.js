(function() {
  define("app", ["marionette"], function(Marionette) {
    return new Marionette.Application();
  });

  require(["jquery", "lodash", "app", "./router"], function($, _, app, Router) {
    window.app = app;
    app.addInitializer(function() {
      return app.router = new Router();
    });
    app.on("start", function() {
      return Backbone.history.start({
        pushState: true
      });
    });
    return $(function() {
      return app.start();
    });
  });

}).call(this);
