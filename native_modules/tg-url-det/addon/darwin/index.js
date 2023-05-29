var Application = require('jxa').Application

module.exports = function(callback) {
  Safari(callback)
}

function Safari(callback) {
  try {
    var SystemSafari = Application('System Events').processes['Safari'].windows.name()[0]
    if (SystemSafari != null) {
      var Safari = Application('Safari')
      //globalName = Safari.documents.name()[0];
      callback(Safari.documents.url()[0])
    }
  } catch (e) {
    console.log('Safari not open')
    Chrome(callback)
  }
}

function Chrome(callback) {
  try {
    var SystemChrome = Application('System Events').processes['Chrome'].windows.name()[0]
    if (SystemChrome != null) {
      var Chrome = Application('Google Chrome')
      //globalName = Chrome.windows.activeTab.name()[0];
      callback(Chrome.windows.activeTab.url()[0])
    }
  } catch (e) {
    console.log('Chrome not open')
    return
  }
}
