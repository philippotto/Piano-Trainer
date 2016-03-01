/* define
jquery : $
backbone : Backbone
*/

export default class UberRouter extends Backbone.Router {


  initialize() {
    this.whitelist = [];

    this.$rootEl = $(this.rootSelector);
    this.$navbarEl = $(this.navbarSelector);
    this.activeViews = null;
    return this.handlePageLinks();
  }


  changeView(...views) {

    // Remove current views
    if (this.activeViews) {
      var iterable = this.activeViews;
      for (var i = 0, view; i < iterable.length; i++) {
        // prefer Marionette's close() function to Backbone's remove()
        view = iterable[i];
        if (view.close) {
          view.close();
        } else {
          view.remove();
        }
      }
    } else {
      // we are probably coming from a URL that isn't a Backbone.View yet (or page reload)
      this.$rootEl.empty();
    }

    // Add new views
    this.activeViews = views;

    for (var j = 0, view; j < views.length; j++) {
      view = views[j];
      this.$rootEl.append(view.render().el);
    }

    return
  }
;


  changeTitle(title) {
    window.document.title = title;
    return
  }
;


  changeActiveNavbarItem(url) {
    this.$navbarEl.find(".active").removeClass("active");
    if (url) {
      this.$navbarEl.find(`a[href=\"${url}\"]`).closest("li").addClass("active");
    }
    return
  }
;


  handlePageLinks() {
    // handle all links and manage page changes (rather the reloading the whole site)
    return $(document).on("click", "a", (evt) => {

      var url = $(evt.currentTarget).attr("href");
      if (url === "#") {
        return
      }
;

      // allow opening links in new tabs
      if (evt.metaKey) {
        return
      }
;

      // allow target=_blank etc
      if (evt.currentTarget.target !== "") {
        return
      }
;

      if (_.contains(this.whitelist, url) || url.indexOf("http") === 0) {
        return
      }
;

      var urlWithoutSlash = url.slice(1);
      for (var route in this.routes) {
        var regex = this._routeToRegExp(route);
        if (regex.test(urlWithoutSlash)) {
          evt.preventDefault();
          this.navigate(url, {trigger : true});

          return
        }
      }
;

      return
    }
    );
  }
}
