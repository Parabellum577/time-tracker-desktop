var htmlObject = {
  title: document.querySelector('#line-title'),
  message: document.querySelector('.notification-message'),
  image: document.querySelector('.notification-top-image img'),
  openText: document.querySelector('.notification-open'),
  skipText: document.querySelector('.notification-skip'),
  notificationElement: document.querySelector('.notification-background'),
  notificationButtons: document.querySelector('.notification-buttons'),
  skipBtn: document.querySelector('.notification-skip-button'),
  openBtn: document.querySelector('.notification-open-button'),
  top: document.querySelector('.notification-top'),
  lastLine: document.querySelector('.last-line'),
}
htmlObject.preTitle = document.querySelector('#issue')
htmlObject.postTitle = document.querySelector('#expired')

htmlObject.notificationElement = document.querySelector('.notification-background')
htmlObject.content = document.querySelector('#notification-content')

htmlObject.openButton = document.querySelector('.notification-open-button')

htmlObject.skipButton = document.querySelector('.notification-skip-button')

module.exports = htmlObject
