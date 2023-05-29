'use strict'

const { ipcRenderer } = require('electron')

const requests = []
const networkPanel = document.querySelector('.network-panel>table')
ipcRenderer.on('requestStarted', (event, arg) => {
  const time = new Date().getTime()
  requests.push({
    ...arg,
    startTime: time,
    endTime: time,
    status: 'PENDING',
    result: null,
    error: null,
  })
  const rowNode = document.createElement('tr')
  rowNode.setAttribute('data-id', arg.id)
  const statusNode = document.createElement('td')
  statusNode.innerHTML = '<div class="request pending"></div>'
  const endpointNode = document.createElement('td')
  endpointNode.innerText = arg.method
  const timeNode = document.createElement('td')
  timeNode.innerText = '...'
  rowNode.appendChild(statusNode)
  rowNode.appendChild(endpointNode)
  rowNode.appendChild(timeNode)
  networkPanel.appendChild(rowNode)
})

ipcRenderer.on('requestSuccess', (event, arg) => {
  const endTime = new Date().getTime()
  for (let i = requests.length - 1; i >= 0; i--) {
    if (requests[i].id === arg.id) {
      requests[i].endTime = endTime
      requests[i].result = arg.result
      const row = document.querySelector(`tr[data-id="${arg.id}"]`)
      row.children[0].children[0].className = 'request success'
      row.children[2].innerText = formatTime(requests[i].endTime - requests[i].startTime)
      break
    }
  }
})

ipcRenderer.on('requestError', (event, arg) => {
  if (!arg.error) {
    arg.id = JSON.parse(arg.config.data).id
    arg.error = {
      code: arg.response.status,
      message: `HTTP -ERROR:${arg.response.statusText}`,
    }
  }

  const endTime = new Date().getTime()
  for (let i = requests.length - 1; i >= 0; i--) {
    if (requests[i].id === arg.id) {
      requests[i].endTime = endTime
      requests[i].error = arg.error
      const row = document.querySelector(`tr[data-id="${arg.id}"]`)
      row.children[0].children[0].className = 'request error'
      row.children[2].innerText = formatTime(requests[i].endTime - requests[i].startTime)
      break
    }
  }
})

function formatTime(miliseconds) {
  if (miliseconds < 1000) {
    return `${miliseconds} ms`
  } else if (miliseconds < 60000) {
    return `${miliseconds / 1000} s`
  }
}

document.addEventListener('click', event => {
  const clickedElement = event.path.find(i => i.getAttribute && i.getAttribute('data-id'))
  const id = clickedElement.getAttribute('data-id')
  const request = requests.find(req => req.id === id)
  if (!request) {
    return
  }

  const allRequests = document.querySelectorAll('.selected-request')
  allRequests.forEach(node => {
    node.classList.remove('selected-request')
  })
  clickedElement.classList.add('selected-request')

  // REQUEST
  const requestMethodNode = document.querySelector('#request-method')
  requestMethodNode.innerText = request.method
  const requestPayloadNode = document.querySelector('#request-payload')
  requestPayloadNode.innerText = JSON.stringify(request.params, ' ', 2)
  hljs.highlightBlock(requestPayloadNode.parentNode)

  // RESPONSE
  const responseContainerNode = document.querySelector('#response-content')
  // clear all children
  while (responseContainerNode.firstChild) {
    responseContainerNode.removeChild(responseContainerNode.firstChild)
  }

  const labelNode = document.createElement('p')
  const resultContainerNode = document.createElement('pre')
  const resultNode = document.createElement('code')
  resultNode.className = 'json'
  if (request.result) {
    labelNode.innerText = 'Result:'
    resultNode.innerText = JSON.stringify(request.result, ' ', 2)
  } else {
    labelNode.innerText = 'Error:'
    resultNode.innerText = JSON.stringify(request.error, ' ', 2)
  }
  resultContainerNode.appendChild(resultNode)
  hljs.highlightBlock(resultContainerNode)
  responseContainerNode.appendChild(labelNode)
  responseContainerNode.appendChild(resultContainerNode)
})
