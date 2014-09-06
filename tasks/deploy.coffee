deploy = require("gulp-gh-pages")

module.exports = (gulp, $, options) ->

  gulp.task("deploy", (done) ->
    gulp.src(options.dest.dir + "/**/*")
      .pipe(deploy())
  )
