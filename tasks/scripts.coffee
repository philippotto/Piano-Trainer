path = require("path")
module.exports = (gulp, $, options) ->

  gulp.task("scripts", ->

    gulp.src(options.src.scripts)
      .pipe($.changed(
        options.dest.scripts
        extension : ".js"
      ))
      # .pipe($.sourcemaps.init())
      .pipe($.if(
        (file) ->
          return path.extname(file.path) == ".coffee"
        $.coffee()
          .on("error", $.handleError)
      ))
      .on("error", $.handleError)
      # .pipe($.sourcemaps.write())
      .pipe(gulp.dest(options.dest.scripts))
      .pipe($.logger())
  )

  gulp.task("scripts_min", ["scripts"], ->
    $.amdOptimize.src("index"
      loader : $.amdOptimize.loader(
        (name) -> "#{options.dest.dir}/scripts/#{name}.js"
      )
      configFile : gulp.src("#{options.src.dir}/scripts/require_config.coffee").pipe($.coffee())
    )
      .on("error", $.handleError)
      .pipe($.concat("index.min.js"))
      .pipe(gulp.dest(options.dest.scripts))
      .pipe($.logger())

  )
