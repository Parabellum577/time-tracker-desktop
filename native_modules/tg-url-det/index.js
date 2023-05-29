osName = process.platform

if (osName == 'win32') {
  const addon = require('./build/Release/addon')
  module.exports = function(callback) {
    callback(addon.getUrl())
  }
}
if (osName == 'darwin') {
  const darwin = require('./addon/darwin')
  module.exports = function(callback) {
    darwin(callback)
  }
}
if (osName == 'linux') {
  var linux = require('./addon/linux')
  module.exports = function(callback) {
    linux(callback)
  }
}
