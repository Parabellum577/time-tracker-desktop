import axios from 'axios'
import * as _ from 'lodash'
import * as uuid from 'uuid'
import * as https from 'https'
import { Service, Payloads } from '@api-types'
import { sendToNetworkMonitor } from '@electronMain/devtools/main-process-dev-tools/devtools'
import { getAuthData, IAuthData, updateRefreshToken } from '@store/auth/utils'
import { isRenderer } from '@utils'
import { remote, ipcRenderer, session } from 'electron'
import time from './time'
import api from './api'
import { call } from 'redux-saga/effects'

const SECONDS_IN_MINUTE = 60

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.message === 'Network Error') {
      return Promise.reject({ code: -1, message: 'NETWORK_ERROR' })
    }
    return Promise.reject(error)
  },
)

const NO_INTERNET_CONNECTION = {
  message: 'NETWORK_ERROR',
  code: -1,
}

export default function callApi(service: Service, methodName: string, payloadData?: Payloads, isError?: boolean): any {
  const networkMonitorHandler = isRenderer() ? ipcRenderer.send : sendToNetworkMonitor
  const request = buildRequest(service, methodName, payloadData)
  networkMonitorHandler('requestStarted', request.data)
  return axios(request)
    .then(response => {
      if (response.data.error) {
        throw response
      } else if (response.data.result) {
        networkMonitorHandler('requestSuccess', response.data)
        return response.data.result
      }
      networkMonitorHandler('requestError', response)
      return null
    })
    .catch(async response => {
      if (!response.status || response.code === 'ENOTFOUND') {
        networkMonitorHandler('requestError', {
          id: request.data.id,
          error: NO_INTERNET_CONNECTION,
        })
        throw NO_INTERNET_CONNECTION
      }
      networkMonitorHandler('requestError', response.data)
      if (response.data && response.data.error) {
        if (response.data.error && response.data.error.message === 'TOKEN_EXPIRED') {
          await updateRefreshToken()
          if (!isError) {
            return callApi(service, methodName, payloadData, true)
          }
        }
        throw response.data.error
      } else {
      }
      throw response
    })
}

const httpsAgent = new https.Agent({ keepAlive: false })

function buildRequest(service: Service, methodName: string, payloadData = {}) {
  const method = methodName.indexOf('.') !== -1 ? methodName : `API.${methodName}`

  const authData: IAuthData = getAuthData()
  const Token = authData ? authData.Token : ''

  const now = time.now()

  // Remote Procedure Delegate
  const Context = {
    Token,
    Deadline: now + 60,
    TimeOffset: new Date().getTimezoneOffset() * SECONDS_IN_MINUTE * -1,
    ClientTimeUnix: now,
    TracingID: authData ? authData.TracingID : '',
  }

  const serviceURL = `${process.env.API_URL}/${service}/rpc`

  const request: any = {
    url: serviceURL,
    method: 'POST',
    httpsAgent,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data: {
      id: String(uuid.v4()),
      jsonrpc: '2.0',
      method,
      params: {
        Context,
        ...payloadData,
      },
    },
  }

  if (!isRenderer) {
    request.headers.Connection = 'close'
  }

  return request
}

export function setAuthCookies() {
  const currentSession = isRenderer() ? remote.session : session
  return new Promise(resolve => {
    currentSession.defaultSession.cookies.set(
      {
        url: process.env.API_URL,
        name: 'Authorization',
        value: getAuthData().Token,
      },
      resolve,
    )
  })
}

export const delay = (timeOfDelayMS: number) => new Promise(resolve => setTimeout(resolve, timeOfDelayMS))

export const sagaCallApiRetried = <T extends (...args: any) => ReturnType<T>>(method: T, payload: Parameters<T>[0]) =>
  call(callRetriedApi, method, payload, [100, 1000, 3000, 10000])

export async function callRetriedApi<T extends (...args: any) => ReturnType<T>>(
  apiFunction: T,
  payload: Parameters<T>[0],
  retryDelays: number[] = [1000, 3000, 5000, 10000, 10000, 10000, 10000],
) {
  const delays = [0, ...retryDelays]
  for (let i = 0; i < delays.length; i++) {
    const timeOfDelay = delays[i]
    try {
      await delay(timeOfDelay)
      return await apiFunction(payload)
    } catch (error) {
      console.error('ERROR: ', error)
      if (i === delays.length - 1) {
        throw error
      }
    }
  }
}
