module.exports = (gulp, $, options) ->

  gulp.task("clean", (done) ->
    $.rimraf(options.dest.dir, done)
  )
