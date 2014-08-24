module.exports = (gulp, $, options) ->

  gulp.task("images", (done) ->
    gulp.src(options.src.images)
      .pipe($.changed(options.dest.images))
    	.pipe($.imagemin(
        progressive : true
        interlaced : true
      ))
    	.pipe(gulp.dest(options.dest.images))
      .pipe($.logger())
  )
