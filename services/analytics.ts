import * as uuid from 'uuid/v4'
import axios from 'axios'
import * as _ from 'lodash'
import * as q from 'q'
import * as html2canvasRaw from 'html2canvas'
import * as jsMd5 from 'js-md5'
import time from './time'

const html2canvas: typeof html2canvasRaw['default'] = html2canvasRaw as any // Fix types

interface IRoute {
  id: number
  path: string
}

const currentView: IRoute = { path: 'unsetted', id: -1 }
let appId: string
let version: string
let session: string
let userId: string = localStorage.getItem('userId')
let serverUrl: string = 'https://ux-analytics.qarea.org'
// let serverUrl: string = 'http://localhost:8001'

const hashObject: { [xpath: string]: string } = {}

export default async (
  newAppId: string,
  newVersion: string,
  newServerUrl: string = serverUrl,
  newUserId: string = localStorage.getItem('userId') || uuid(),
) => {
  localStorage.setItem('userId', newUserId)
  userId = newUserId
  appId = newAppId
  version = newVersion
  serverUrl = newServerUrl
  if (!session) {
    session = await createSession()
    console.log('session', session)
  }

  document.querySelector('body').addEventListener('click', async event => {
    if (!(event.target instanceof HTMLElement)) {
      return
    }
    const formData = new FormData()
    formData.append('action_id', '0') // FIXME: Get actions from server
    formData.append('session', session)
    formData.append('time', time.nowExact().toString())
    formData.append('user_id', userId)
    formData.append('client_x', event.clientX.toString())
    formData.append('client_y', event.clientY.toString())
    formData.append('app_version', version)

    const xpath = getXPathForElement(event.target)
    if (!(xpath in hashObject)) {
      hashObject[xpath] = jsMd5(xpath)
    }
    formData.append('element_id', hashObject[xpath])

    await axios.post(`${serverUrl}/actions`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  })
  let isFocused = true
  window.addEventListener(
    'mousemove',
    _.debounce(async event => {
      if (!(event.target instanceof HTMLElement)) {
        return
      }

      const formData = new FormData()
      formData.append('action_id', '1')
      formData.append('session', session)
      formData.append('time', time.nowExact().toString())
      formData.append('user_id', userId)
      formData.append('client_x', event.clientX.toString())
      formData.append('client_y', event.clientY.toString())
      formData.append('app_version', version)
      formData.append('element_id', '')

      await axios.post(`${serverUrl}/actions`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    }, 100),
  )
  window.addEventListener('focus', () => (isFocused = true))
  window.addEventListener('blur', () => (isFocused = false))
  setImmediate(async () => {
    while (true) {
      await delay(500)
      console.log('isFocused', isFocused)
      if (isFocused) {
        try {
          await sendScreenshot()
        } catch (error) {
          console.error(error)
        }
      }
    }
  })
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const setAnalyticsView = async (route: IRoute['path']) => {}

const createSession = async () => {
  const formData = new FormData()
  formData.append('userId', userId)
  formData.append('appId', appId)
  formData.append('appVersion', version)
  const response = await axios.post(`${serverUrl}/sessions`, formData)
  if (response.status === 200) {
    return response.data
  } else {
    throw new Error(response.statusText)
  }
}

const sendScreenshot = async () => {
  const html = document.querySelector('html')
  const canvas: HTMLCanvasElement = await html2canvas(html, {
    height: html.clientHeight,
    width: html.clientWidth,
  })
  const defer = q.defer()
  canvas.toBlob(
    async image => {
      const formData = new FormData()
      formData.append('session', session)
      formData.append('time', time.nowExact().toString())
      formData.append('screen', image)
      try {
        await axios.post(`${serverUrl}/uploadScreen`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        defer.resolve()
      } catch (error) {
        console.error(error)
        defer.reject(error)
      }
    },
    'image/jpg',
    0.25,
  )
  return defer.promise
}

// https://stackoverflow.com/a/43688599
const getXPathForElement = (element: Element): string => {
  const idx = (sib: Element, name?: string): number =>
    sib
      ? parseInt(idx(sib.previousElementSibling, name || sib.localName).toString(), 10) +
        (sib.localName === name ? 1 : 0)
      : 1
  const segs = (elm: any): any[] =>
    !elm || elm.nodeType !== 1
      ? ['']
      : elm.id && document.getElementById(elm.id) === elm
      ? [`id("${elm.id}")`]
      : [...segs(elm.parentNode), `${elm.localName.toLowerCase()}[${idx(elm)}]`]
  return segs(element).join('/')
}
