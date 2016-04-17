(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  define(["jquery", "backbone"], function($, Backbone) {
    var UberRouter;
    return UberRouter = (function(_super) {
      __extends(UberRouter, _super);

      function UberRouter() {
        return UberRouter.__super__.constructor.apply(this, arguments);
      }

      UberRouter.prototype.whitelist = [];

      UberRouter.prototype.initialize = function() {
        this.$rootEl = $(this.rootSelector);
        this.$navbarEl = $(this.navbarSelector);
        this.activeViews = null;
        return this.handlePageLinks();
      };

      UberRouter.prototype.changeView = function() {
        var view, views, _i, _j, _len, _len1, _ref;
        views = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (this.activeViews) {
          _ref = this.activeViews;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            view = _ref[_i];
            if (view.close) {
              view.close();
            } else {
              view.remove();
            }
          }
        } else {
          this.$rootEl.empty();
        }
        this.activeViews = views;
        for (_j = 0, _len1 = views.length; _j < _len1; _j++) {
          view = views[_j];
          this.$rootEl.append(view.render().el);
        }
      };

      UberRouter.prototype.changeTitle = function(title) {
        window.document.title = title;
      };

      UberRouter.prototype.changeActiveNavbarItem = function(url) {
        this.$navbarEl.find(".active").removeClass("active");
        if (url) {
          this.$navbarEl.find("a[href=\"" + url + "\"]").closest("li").addClass("active");
        }
      };

      UberRouter.prototype.handlePageLinks = function() {
        return $(document).on("click", "a", (function(_this) {
          return function(evt) {
            var regex, route, url, urlWithoutSlash;
            url = $(evt.currentTarget).attr("href");
            if (url === "#") {
              return;
            }
            if (evt.metaKey) {
              return;
            }
            if (evt.currentTarget.target !== "") {
              return;
            }
            if (_.contains(_this.whitelist, url) || url.indexOf("http") === 0) {
              return;
            }
            urlWithoutSlash = url.slice(1);
            for (route in _this.routes) {
              regex = _this._routeToRegExp(route);
              if (regex.test(urlWithoutSlash)) {
                evt.preventDefault();
                _this.navigate(url, {
                  trigger: true
                });
                return;
              }
            }
          };
        })(this));
      };

      return UberRouter;

    })(Backbone.Router);
  });

}).call(this);
