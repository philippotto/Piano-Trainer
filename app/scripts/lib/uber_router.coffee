### define
jquery : $
backbone : Backbone
###

class UberRouter extends Backbone.Router

  whitelist : []

  initialize : ->

    @$rootEl = $(@rootSelector)
    @$navbarEl = $(@navbarSelector)
    @activeViews = null
    @handlePageLinks()


  changeView : (views...) ->

    # Remove current views
    if @activeViews
      for view in @activeViews
        # prefer Marionette's close() function to Backbone's remove()
        if view.close
          view.close()
        else
          view.remove()
    else
      # we are probably coming from a URL that isn't a Backbone.View yet (or page reload)
      @$rootEl.empty()

    # Add new views
    @activeViews = views

    for view in views
      @$rootEl.append(view.render().el)

    return


  changeTitle : (title) ->
    window.document.title = title
    return


  changeActiveNavbarItem : (url) ->
    @$navbarEl
      .find(".active")
      .removeClass("active")
    if url
      @$navbarEl
        .find("a[href=\"#{url}\"]")
        .closest("li")
        .addClass("active")
    return


  handlePageLinks  : ->
    # handle all links and manage page changes (rather the reloading the whole site)
    $(document).on("click", "a", (evt) =>

      url = $(evt.currentTarget).attr("href")
      if url == "#"
        return
        
      # allow opening links in new tabs
      if evt.metaKey
        return
        
      # allow target=_blank etc
      if evt.currentTarget.target != ""
        return

      if _.contains(@whitelist, url) or url.indexOf("http") == 0
        return

      urlWithoutSlash = url.slice(1)
      for route of @routes
        regex = @_routeToRegExp(route)
        if regex.test(urlWithoutSlash)
          evt.preventDefault()
          @navigate(url, trigger : true)
 
          return

      return
    )
