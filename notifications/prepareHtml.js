const htmlObject = require('./htmlObject')
const electron = require('electron')

module.exports = function(notificationObject) {
  notification.showInactive()
  htmlObject.notificationElement.style.height = ''
  htmlObject.notificationElement.style.width = ''
  //Setting down Width of the element
  switch (notificationObject.notificationType) {
    case 'ApproveMail':
    case 'NotYourTask':
    case 'DifferTime':
    case 'Anonymous':
    case 'AllTaskFinished':
    case 'Break':
      htmlObject.notificationElement.style.fontSize = '12px'
      htmlObject.notificationElement.style.letterSpacing = '0.02em'
      htmlObject.message.style.textAlign = 'left'
      htmlObject.message.style.width = '204px'
      htmlObject.message.style.paddingLeft = '56pt'
      htmlObject.openBtn.style.backgroundColor = 'rgba(115, 197, 70, 1)'
    case 'IssueExp':
      htmlObject.notificationElement.classList.add('addBigBackground')
      htmlObject.message.style.paddingLeft = '56pt'
      break
    default:
      htmlObject.notificationElement.classList.remove('addBigBackground')
  }
  //Setting down Height of the element
  switch (notificationObject.notificationType) {
    case 'Anonymous':
      if (process.platform === 'linux') {
        htmlObject.notificationElement.style.height = '93pt'
        htmlObject.notificationElement.style.width = '250pt'
      } else {
        htmlObject.notificationElement.style.height = '81pt'
      }
      break
    case 'Activity':
    case 'ScreenshottingOff':
    case 'AllTaskFinished':
      htmlObject.notificationElement.style.height = '81pt'
      break
    case 'WorkOnTask':
      htmlObject.notificationButtons.removeChild(htmlObject.skipBtn)
      htmlObject.openBtn.style.backgroundColor = 'rgba(0, 0, 0, 0)'
      htmlObject.openText.classList.add('workOnTaskButton')
    case 'StopOfTask':
    case 'MoreInfoTask':
    case 'NoTask':
    case 'IssueExp10Min':
    case 'IssueExp':
    case 'Idle':
      htmlObject.notificationElement.style.height = '94pt'
      break
    case 'Update':
    case 'DifferTime':
    case 'ApproveMail':
    case 'Achievement':
    case 'NewDay':
    case 'NotYourTask':
      htmlObject.notificationElement.style.height = '108pt'
      break
    case 'Break':
      htmlObject.notificationElement.style.minHeight = '99px'
      htmlObject.notificationElement.style.maxHeight = '99px'
      break
    default:
      htmlObject.notificationElement.style.height = '81pt'
  }

  //Setting text for element
  htmlObject.title.innerHTML = notificationObject.data.title
  htmlObject.message.innerHTML = notificationObject.data.message
  htmlObject.openText.innerHTML = notificationObject.data.leftButton
  htmlObject.skipText.innerHTML = notificationObject.data.rightButton
  htmlObject.image.setAttribute('src', notificationObject.data.image)

  //Dimensioning and sending back sizes to main process
  var notificationWidth = Math.round(parseFloat(getComputedStyle(htmlObject.notificationElement).width))
  var notificationHeight = Math.round(parseFloat(getComputedStyle(htmlObject.notificationElement).height))
  setSizeForNotification(notificationWidth, notificationHeight)
  htmlObject.content.classList.remove('notDisplay')
}

function setSizeForNotification(winWidth, winHeight) {
  notification.setSize(winWidth, winHeight)
  var size = electron.screen.getPrimaryDisplay().workAreaSize
  var x = size.width - (winWidth + 20)
  var y = size.height - (winHeight + 20)
  notification.setPosition(x, y)
  notification.setAlwaysOnTop(true)
}
