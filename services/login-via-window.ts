import { remote, ipcRenderer } from 'electron'
import * as _ from 'lodash'
import * as q from 'q'

const nodeUrl = require('url')

export const trackers = {
  TRELLO: 'https://trello.com',
  GITHUB: 'https://github.com',
  GITLAB: 'https://gitlab.com',
}

export const getTokenFromOAuthWindow = async (trackerUrl: string) => {
  const defer = q.defer<{ error?: string; oauthKey: string }>()

  const windowOptions = {
    width: 600,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
    },
  }

  const BrowserWindow = remote.BrowserWindow
  const authWindow = new BrowserWindow(windowOptions)

  authWindow.loadURL(trackerUrl)

  authWindow.webContents.setUserAgent(
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
  )

  const filter = {
    urls: [process.env.REDIRECT_URL],
  }

  remote.session.defaultSession.webRequest.onBeforeRequest(filter, (details, callback) => {
    if (details.url.includes(process.env.REDIRECT_URL)) {
      onCallback(details.url)
    }
    callback({ cancel: false })
  })

  authWindow.webContents.on('did-redirect-navigation', (event, oldUrl) => {
    if (oldUrl.includes(process.env.REDIRECT_URL)) {
      onCallback(oldUrl)
    }
  })

  const parseUrl = (hash: string) => hash.replace('#token=', '')

  const onCallback = (url: string) => {
    const urlParts = nodeUrl.parse(url, true)
    const query = urlParts.query
    const token = urlParts.hash && urlParts.hash.length > 1 ? parseUrl(urlParts.hash) : ''
    const code = query.code || query.oauth_verifier
    const oauthKey = token || code
    const error = query.error

    if (error) {
      authWindow.removeAllListeners('closed')
      defer.reject({ error })
      setImmediate(() => {
        clearCookiesAndClose(authWindow)
      })
    } else if (oauthKey) {
      defer.resolve({ oauthKey })
      authWindow.removeAllListeners('closed')
      setImmediate(() => {
        clearCookiesAndClose(authWindow)
      })
    }
  }

  authWindow.on('closed', () => {
    remote.session.defaultSession.webRequest.onBeforeRedirect(null, null) // unsubscribe
    clearCookiesAndClose(authWindow)
  })

  return defer.promise
}

const clearCookiesAndClose = (authWindow: Electron.BrowserWindow) => {
  remote.session.defaultSession.webRequest.onBeforeRequest(null)
  authWindow.webContents.session.clearStorageData(
    {
      storages: ['cookies'],
    },
    () => {
      if (!authWindow.isDestroyed()) {
        authWindow.destroy()
      }
      ipcRenderer.send('focus-window')
    },
  )
}
