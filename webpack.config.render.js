const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const path = require('path')
const packageJSON = require('./package.json')

const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
// const { UnusedFilesWebpackPlugin } = require('unused-files-webpack-plugin')
// const { DuplicatesPlugin } = require('inspectpack/plugin')
// const CircularDependencyPlugin = require('circular-dependency-plugin')
// const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
// const smp = new SpeedMeasurePlugin()

const CSSModuleLoader = {
  loader: 'css-loader',
  options: {
    modules: true,
    sourceMap: true,
    localIdentName: '[local]__[hash:base64:5]',
  },
}

const CSSLoader = {
  loader: 'css-loader',
  options: {
    modules: false,
    sourceMap: true,
  },
}

const sassLoader = {
  loader: 'sass-loader',
  options: {
    data: '@import "variables";',
    includePaths: [path.resolve(__dirname, './render/src')],
  },
}

var DEFAULT_STAGE = 'production'
var stage = process.env.BUILD_STAGE || DEFAULT_STAGE
var config = require('./config')[stage]
console.log('stage', stage)

let webpackConfig = {
  mode: 'production',
  target: 'electron-renderer',
  entry: {
    index: './render/src/App/index.tsx',
  },
  output: {
    filename: 'bundle.js',
    path: `${__dirname}/build-render`,
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: stage === 'local' ? 'inline-source-map' : 'none',

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.tsx', '.js', '.json'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: './tsconfig.render.json',
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
              configFile: 'tsconfig.render.json',
            },
          },
        ],
      },

      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        enforce: 'pre',
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: ['cache-loader', 'source-map-loader'],
      },

      // styles
      {
        test: /\.scss$/,
        exclude: /\.module\.scss$/,
        use: ['cache-loader', 'style-loader', CSSLoader, sassLoader],
      },
      {
        test: /\.module\.scss$/,
        use: ['cache-loader', 'style-loader', CSSModuleLoader, sassLoader],
      },
      {
        test: /\.css$/,
        exclude: /\.module\.css$/,
        use: ['cache-loader', 'style-loader', CSSLoader],
      },
      {
        test: /\.module\.css$/,
        use: ['cache-loader', 'style-loader', CSSModuleLoader],
      },

      // images
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
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
      {
        test: /\.node$/,
        use: ['cache-loader', 'node-loader'],
      },
      // fonts
      {
        test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.STAGE': JSON.stringify(stage),
      'process.env.version': JSON.stringify(packageJSON.version),
      'process.env.UPDATE_FOLDER': JSON.stringify(process.env.UPDATE_FOLDER || 'v3'),
      'process.env.TARGET_PACKAGE': JSON.stringify(process.env.TARGET_PACKAGE || 'linux'),
      'process.env.NODE_ENV': stage === 'local' ? JSON.stringify('development') : JSON.stringify('production'),
      'process.env.API_URL': JSON.stringify(config.API_URL),
      'process.env.REDIRECT_URL': JSON.stringify(config.REDIRECT_URL),
      'process.env.WSS_URL': JSON.stringify(config.WSS_URL),
      'process.env.SENTRY_KEY': JSON.stringify(config.SENTRY_KEY),
      'process.env.PROTOCOL': JSON.stringify(config.PROTOCOL),
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      chunks: ['index'],
      minify: true,
      template: './render/public/index.html',
    }),
    new webpack.WatchIgnorePlugin([/scss\.d\.ts$/]),
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
      tsconfig: './tsconfig.render.json',
      tslint: true,
      tslintAutoFix: true,
      ignoreLints: './render/**/*.d.ts',
    }),
  )
}

module.exports = webpackConfig
// module.exports = smp.wrap(webpackConfig)
