(function() {
  require(["jquery", "lodash", "React", "views/main_view"], function($, _, React, MainView) {
    return React.render(React.createElement(MainView), document.getElementById('main'));
  });

}).call(this);
