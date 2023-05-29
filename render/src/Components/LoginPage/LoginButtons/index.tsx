import * as React from 'react'
import IconWrapper from '@components/IconWrapper'
import { LOGIN_TRACKERS } from '@services/helpers'
import { getTokenFromOAuthWindow, trackers } from '@services/login-via-window'
import api from '@services/api'
import { setAuthData } from '@store/auth/utils'
import { IOAuthCodePayload } from '@services/api-types'
import { useDispatch } from 'react-redux'
import * as authActions from '@store/auth/actions'
import * as alertActions from '@store/alerts/actions'
import { IAlert } from '@store/alerts/types'

const styles = require('./login-buttons.module.scss')

const LoginButtons: React.FC = () => {
  const dispatch = useDispatch()
  const loginUser = React.useCallback(() => dispatch(authActions.loginUserViaOAuth.request()), [dispatch])
  const showAlert = React.useCallback(() => (alert: IAlert) => dispatch(alertActions.showAlertMessage.request(alert)), [
    dispatch,
  ])

  const openViaLoginWindow = async (trackerType: keyof typeof trackers) => {
    try {
      const { URL, TrackerID } = await fetchUrlViaTrackerType(trackerType)
      const { oauthKey } = await getTokenFromOAuthWindow(URL)

      const payload: IOAuthCodePayload = { TrackerID }

      payload.Code = oauthKey
      payload.Token = oauthKey

      const result = await api.user.OAuthLogin(payload)
      setAuthData(result)

      loginUser()
    } catch (error) {
      if (error && error.message) {
        setAuthData(null)
        showAlert()({ alertType: 'error', alertMessage: error.message })
      }
    }
  }

  const fetchUrlViaTrackerType = async (trackerType: keyof typeof trackers) => {
    try {
      const result = await api.user.AddAnonymUser()
      const trackerUrl = trackers[trackerType]
      setAuthData(result)
      const { TrackerID } = await api.tracker.GetTracker({ URL: trackerUrl })
      const { URL } = await api.tracker.GetOAuthURL({ TrackerID })
      return { URL, TrackerID }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className={styles.loginViaBlock}>
      <div className={styles.row}>
        {LOGIN_TRACKERS.map(tracker => (
          <div className={styles.imgBlock} key={tracker} onClick={() => openViaLoginWindow(tracker)}>
            <IconWrapper name={tracker.toUpperCase()} height="17px" width="17px" fontSize="17px" />
            <span className={styles.trackerIcon}>{tracker}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default React.memo(LoginButtons)
