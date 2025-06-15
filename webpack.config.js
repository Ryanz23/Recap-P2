const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/app.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'service-worker.js', to: '' },
        { from: 'manifest.json', to: '' },
        { from: 'favicon.ico', to: '' },
        { from: 'src/icons', to: 'src/icons' },
        { from: 'src/screenshots', to: 'src/screenshots' }
      ]
    })
  ],
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    hot: false,
    liveReload: false,
  },
};