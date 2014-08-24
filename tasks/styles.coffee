module.exports = (gulp, $, options) ->

  gulp.task("styles", ->

    gulp.src(options.src.styles)
      # .pipe($.sourcemaps.init())
      .pipe($.less(
        paths : [
          "dist"
          "app/styles"
        ]
      ))
      .on("error", $.handleError)
      # .pipe($.sourcemaps.write())
      .pipe(gulp.dest(options.dest.styles))
      .pipe($.logger())

  )
