require('coffee-script').register();

var options = require("./gulp_options.json");

// Load gulp and dependent plugins
var gulp, util, path, through2, $;

try {
  gulp = require("gulp");
  through2 = require("through2");

  $ = require("gulp-load-plugins")();

  var modules = options.additionalModules;
  if (modules) {
    for (key in modules) {
      $[key] = require(modules[key]);
    }
  }

  path = require("path");
  util = require("gulp-util");

} catch (err) {
  if (err.code == "MODULE_NOT_FOUND") {
    console.error("Please run `npm install`. Some node modules/dependencies are not installed.");
    console.error(err);
    process.exit(-1);
  }
  else {
    throw err;
  }
}


$.handleError = function (err) {
  util.log(util.colors.red("!!"), err.toString());
  util.beep();
  if (this.end) {
    this.end();
  }
}

$.logger = function () {
  return through2.obj(function (file, enc, done) {
    util.log(">>", util.colors.yellow(path.relative(process.cwd(), file.path)));
    done(null, file);
  });
}

// Load tasks from `tasks` directory
var tasks = require("require-dir")("./tasks");
Object.keys(tasks).forEach(function (taskFilename) {
  // Register task
  tasks[taskFilename](gulp, $, options);
});



gulp.task("watching", function (done) {
  gulp.watch(options.src.dir + "/**/*", ["build"]);
});

gulp.task("build", ["scripts", "scripts_min", "styles", "html", "images"]);
gulp.task("watch", ["build", "serve", "watching"]);

gulp.task("default", ["build"]);
