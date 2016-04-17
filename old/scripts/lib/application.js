(function() {
  define(["backbone"], function(Backbone) {
    var Application;
    return Application = (function() {
      function Application() {
        _.extend(this, Backbone.Events);
      }

      return Application;

    })();
  });

}).call(this);
