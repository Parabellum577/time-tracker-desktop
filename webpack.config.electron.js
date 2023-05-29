const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const webpack = require('webpack')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
// const { DuplicatesPlugin } = require('inspectpack/plugin')
// const CircularDependencyPlugin = require('circular-dependency-plugin')
// const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
// const smp = new SpeedMeasurePlugin()

var DEFAULT_STAGE = 'production'
var stage = process.env.BUILD_STAGE || DEFAULT_STAGE
var config = require('./config')[stage]
console.log('stage', stage)

let webpackConfig = {
  mode: 'production',
  target: 'electron-main',
  entry: {
    index: './electron-main/src/main.ts',
  },
  output: {
    filename: 'main.js',
    path: `${__dirname}/build-electron-main`,
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: stage === 'local' ? 'inline-source-map' : 'none',

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.tsx', '.js', '.json'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: './tsconfig.electron.json',
        extensions: ['.ts', '.tsx', '.js', '.json'],
        baseUrl: '.',
      }),
    ],
  },

  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      {
        test: /\.(t|j)sx?$/,
        exclude: /node_modules/,
        use: [
          'cache-loader',
          {
            loader: 'ts-loader',
            options: {
              // disable type checker - we will use it in fork plugin
              transpileOnly: true,
              configFile: 'tsconfig.electron.json',
            },
          },
        ],
      },

      {
        test: /\.node$/,
        use: ['cache-loader', 'node-loader'],
      },
      // images
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          'cache-loader',
          'file-loader',
          {
            loader: 'image-webpack-loader',
            options: {
              disable: true,
              outputPath: 'images/',
            },
          },
        ],
      },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['cache-loader', 'source-map-loader'],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.STAGE': JSON.stringify(stage),
      'process.env.API_URL': JSON.stringify(config.API_URL),
      'process.env.UPDATE_FOLDER': JSON.stringify(process.env.UPDATE_FOLDER || 'v3'),
      'process.env.TARGET_PACKAGE': JSON.stringify(process.env.TARGET_PACKAGE || 'linux'),
      'process.env.REDIRECT_URL': JSON.stringify(config.REDIRECT_URL),
      'process.env.WSS_URL': JSON.stringify(config.WSS_URL),
      'process.env.SENTRY_KEY': JSON.stringify(config.SENTRY_KEY),
      'process.env.PROTOCOL': JSON.stringify(config.PROTOCOL),
    }),
    // new BundleAnalyzerPlugin(),
    // new DuplicatesPlugin(),
    // new CircularDependencyPlugin(),
    new LodashModuleReplacementPlugin({
      collections: true,
      paths: true,
      shorthands: true,
    }),
  ],
}

if (stage === 'local') {
  webpackConfig.watch = true
  webpackConfig.mode = 'development'
  webpackConfig.devtool = 'inline-source-map'
  webpackConfig.stats = 'errors-only'

  webpackConfig.plugins.push(
    new ForkTsCheckerWebpackPlugin({
      tsconfig: './tsconfig.electron.json',
      tslint: true,
      tslintAutoFix: true,
    }),
  )
}

module.exports = webpackConfig
// module.exports = smp.wrap(webpackConfig)
