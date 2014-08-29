var tests = [];
for (var file in window.__karma__.files) {
    if (/spec\.js$/.test(file)) {
      // remove absolute path elements so that all dependencies
      // will be fetched with file extension
      file = file.replace(/^\/base\/|\.js$/g,'');
      tests.push(file);
    }
}

requirejs.config({
    // Karma serves files from '/base'
    // baseUrl: '/base',

    // ask Require.js to load the application Require.js configuration
    deps: ['base/scripts/require_config'],

    callback: function() {
      // overwrite the baseUrl (was set by require_config.js)
      require.config({baseUrl : "/base"});

      // since Karma's server wants to deliver all assets via /base,
      // we have to patch the actual require_config path elements
      var paths = requirejs.s.contexts._.config.paths;
      for (k in paths) {
        paths[k] = paths[k].replace("../", "");
      }

      // ask Require.js to load these files (all our tests)
      // start test run, once Require.js is done
      requirejs(tests, window.__karma__.start);
    }
});
