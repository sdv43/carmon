/* eslint-disable */
const path = require('path')
const webpack = require('webpack')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  devtool: false,
  mode: 'development',
  target: ['web', 'es5'],
  entry: './src/index.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.(?:js|mjs|cjs|ts)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            targets: 'opera 12',
            presets: [
              ['@babel/preset-env', { useBuiltIns: 'usage', corejs: '3.38' }],
              ['@babel/preset-typescript'],
            ],
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
    }),
    new CopyPlugin({
      patterns: [{ from: 'src/assets', to: 'assets' }],
    }),
  ],
}
