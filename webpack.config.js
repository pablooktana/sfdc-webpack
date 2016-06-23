var glob = require('glob');
var path = require('path');
var webpack = require('webpack');

var ExtractTextPlugin = require('extract-text-webpack-plugin');

function isProd() {
  return process.env.NODE_ENV === 'production';
}

var config = {
  devServer: {
    //headers: { 'Access-Control-Allow-Origin': '*' },
    //contentBase: './resources-storage/job_science.resource',
    inline: true,
    //hot: true
  },
  entry: './app/index.js',
  module: {
    loaders: [
       //{ test: /\.js$/, exclude: [/app\/lib/, /node_modules/], loader: 'ng-annotate!babel' },
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel', // 'babel-loader' is also a legal name to reference
      },
      {
        test: /\.html$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'raw',
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url'
      },
      {
        test: /\.css$/,
        exclude: /(node_modules|bower_components)/,
        loader: ExtractTextPlugin.extract('style', 'css'),
      }
    ]
  },
  plugins: [
    isProd() ? new ExtractTextPlugin('dist/bundle.css', {allChunks: true}) : undefined
  ].filter(),
  output: {
    filename: 'bundle.js'
  },
  devtool: 'source-map'
};

if(isProd()) {
  config.output.path = './resources-storage/job_science.resource/dist';
  config.plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = config;
