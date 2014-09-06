var tests = [];
for (var file in window.__karma__.files) {
    if (/spec\.js$/.test(file)) {
      console.log("file",  file);
      file = file.replace(/^\/base\/|\.js$/g,'');
      // file = "../base/scripts/spec/key_converter_spec";
      console.log("file",  file);
      tests.push(file);
    }
}

requirejs.config({
    // Karma serves files from '/base'
    // baseUrl: '/base',

    // ask Require.js to load the application Require.js configuration
    deps: ['base/scripts/require_config'],

    callback: function() {
        // ask Require.js to load these files (all our tests)
        // start test run, once Require.js is done

        require.config({baseUrl : "/base"});


        requirejs(tests, window.__karma__.start);
    }
});
