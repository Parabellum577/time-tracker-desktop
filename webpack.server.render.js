const WebpackDevServer = require('webpack-dev-server')
const webpack = require('webpack')
const config = require('./webpack.config.render')

const compiler = webpack(config)

const server = new WebpackDevServer(compiler, {
  stats: {
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
    errorDetails: true,
    warnings: false,
    publicPath: false,
  },
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
})

const PORT = process.env.PORT || 3000

server.listen(PORT)
