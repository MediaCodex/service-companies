const path = require('path')

/**
 * Output directory
 */
const buildDir = path.join(__dirname, 'build')

/**
 * Lambda Functions
 */
const entryPoints = {
  'http-create': './src/controllers/http/create.js',
  'http-update': './src/controllers/http/update.js',
  'http-index': './src/controllers/http/index.js',
  'http-show': './src/controllers/http/show.js',
  'dynamodb-companies': './src/controllers/dynamodb/companies.js'
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
  }
}
