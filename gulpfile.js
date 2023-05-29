const gulp = require('gulp')
const electron = require('electron-connect').server.create({ path: __dirname })
const webpack = require('webpack')
const gutil = require('gulp-util')
const notifier = require('node-notifier')

const webpackConfig = require('./webpack.config.electron')

let isReady = false

const statsLog = {
  colors: true,
  hash: false,
  version: false,
  assets: false,
  chunks: false,
  modules: false,
  reasons: false,
  children: false,
  source: false,
  errors: true,
  errorDetails: false,
  warnings: false,
  publicPath: false,
}

gulp.task('scripts', done => {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true
  webpack(webpackConfig, onComplete)
  function onComplete(error, stats) {
    if (error) {
      onError(error)
    } else if (stats.hasErrors()) {
      onError(stats.toString(statsLog))
    } else {
      onSuccess(stats.toString(statsLog))
    }
  }

  function onError(error) {
    const formatedError = new gutil.PluginError('webpack', error)
    notifier.notify({
      title: `Error: ${formatedError.plugin}`,
      message: formatedError.message,
    })
    gutil.log('[webpack]', formatedError)
    done(formatedError)
  }

  function onSuccess(detailInfo) {
    if (isReady) {
      electron.restart('--inspect')
    } else {
      electron.start('--inspect')
    }
    isReady = true
    gutil.log('[webpack]', detailInfo)
    done()
  }
})
