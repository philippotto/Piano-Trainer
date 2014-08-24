module.exports = (gulp, $, options) ->

  gulp.task("serve", (done) ->
    gulp.src("dist")
      .pipe($.webserver(
        fallback : "index.html"
        port : options.port
      ))
  )
