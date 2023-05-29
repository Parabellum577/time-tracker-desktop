import persistStore from '../persistStore'
import uuid = require('uuid')
import { callRetriedApi } from '@services/call-api'
import api from '@services/api'

export interface IAuthData {
  Token: string
  Expires: number
  Refresh: string
  TracingID?: string
}

export async function updateRefreshToken(refresh?: string) {
  const refreshToken = refresh || (getAuthData() && getAuthData().Refresh)
  const authData: IAuthData = await callRetriedApi(
    api.user.RefreshToken,
    {
      Refresh: refreshToken,
    },
    [300, 300],
  )

  setAuthData(authData)
  return authData
}

const authKey = process.env.STAGE === 'local' ? 'AUTH_DATA_LOCAL' : 'AUTH_DATA'

export const setAuthData = (data: IAuthData | null) => {
  let TracingID: string = persistStore.get('TRACING_ID')

  if (!TracingID) {
    TracingID = uuid.v4()
    TracingID = TracingID.replace(TracingID.slice(9, 13), 'desk')
    persistStore.set('TRACING_ID', TracingID)
  }

  if (data) {
    data.TracingID = TracingID
  }
  persistStore.set(authKey, data)
}

export const getAuthData = (): IAuthData | null => {
  return persistStore.get(authKey)
}
