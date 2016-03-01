/* eslint-disable no-var, strict */
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');
var port = 1234;
new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  contentBase: "./app/",
  hot: true,
  historyApiFallback: true
}).listen(port, 'localhost', function (err) {
    if (err) {
      console.log(err);
    }
    console.log('Listening at localhost:' + port);
  });
