const path = require('path')
const ZipPlugin = require('zip-webpack-plugin')

/**
 * Output directory
 */
const buildDir = path.join(__dirname, 'build')

/**
 * Lambda Functions
 */
const entryPoints = {
  'http-create': './src/controllers/create.js',
  'http-show': './src/controllers/show.js'
}

/**
 * Bundle each function individually
 */
const plugins = {
  plugins: Object.keys(entryPoints).map((entryName) => new ZipPlugin({
    path: buildDir,
    filename: entryName,
    extension: 'zip'
  }))
}

/**
 * Webpack config
 */
module.exports = {
  mode: 'production',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        type: 'javascript/esm'
      }
    ]
  },
  entry: entryPoints,
  output: {
    libraryTarget: 'commonjs2',
    path: buildDir
  },
  optimization: {
    minimize: false
  },
  ...plugins
}
