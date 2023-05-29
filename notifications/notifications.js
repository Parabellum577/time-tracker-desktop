const ipcRenderer = require('electron').ipcRenderer
const prepareHtml = require('./notifications/prepareHtml')

var notification

window.onload = function() {
  const htmlObject = require('./notifications/htmlObject')
  let notificationObject

  ipcRenderer.on('show-notification', function(event, notificationObjectData) {
    notification = require('electron').remote.getCurrentWindow()
    notificationObject = notificationObjectData
    prepareHtml(notificationObject)
    notification.showInactive()
  })

  ipcRenderer.on('close-notification', function(event) {
    closeNotification()
  })

  function closeNotification() {
    htmlObject.content.classList.add('notDisplay')
    hideNotification()
  }

  function hideNotification() {
    if (!notification.isDestroyed()) {
      ipcRenderer.send('closeWin')
    }
  }

  htmlObject.openButton.addEventListener('click', () => {
    switch (notificationObject.notificationType) {
      case 'Update':
        ipcRenderer.send('autoUpdater:quit-and-install')
        if (process.platform === 'darwin') {
          ipcRenderer.send('app-quit')
        }
        break
      case 'Break':
        ipcRenderer.send('takeBreak')
        break
      default:
        ipcRenderer.send('openMainWindow')
    }
    closeNotification()
  })

  htmlObject.skipButton.addEventListener('click', () => {
    closeNotification()
  })
}
