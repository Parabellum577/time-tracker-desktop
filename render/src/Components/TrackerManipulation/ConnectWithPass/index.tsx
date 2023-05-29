import * as React from 'react'
import * as alertActions from '@store/alerts/actions'

import { useDispatch } from 'react-redux'
import { IPassCredentialsPayload } from '@services/api-types'
import api from '@services/api'
import { updateCacheByTrackersIDArray } from '../helpers'
import IconWrapper from '@components/IconWrapper'
import classNames from 'classnames'
import Loading from '@components/Loading'

const styles = require('../styles.module.scss')
const viaPassStyles = require('./viapass.module.scss')

interface IOwnProps {
  isEditPage: boolean
  trackerType: string
  trackerUrl: string
  TrackerID: number
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  addUserTracker: () => void
  updateUserTracker: () => void
  redirectAndClearContext: () => void
}

const ConnectViaPass: React.FC<IOwnProps> = props => {
  const {
    isEditPage,
    trackerType,
    trackerUrl,
    TrackerID,
    setLoading,
    addUserTracker,
    updateUserTracker,
    redirectAndClearContext,
  } = props
  const [passwordValue, setPasswordValue] = React.useState('')
  const [loginValue, setLoginValue] = React.useState('')
  const [isPasswordShow, setPasswordShow] = React.useState(false)
  const [isConnectWithPassLoader, setConnectWithPassLoader] = React.useState(false)

  const dispatch = useDispatch()

  const showAlert = React.useCallback(
    alert => {
      const action = alertActions.showAlertMessage.request(alert)
      dispatch(action)
    },
    [dispatch],
  )

  const addIntegrationViaPass = async () => {
    try {
      const credentialPayloadByPass: IPassCredentialsPayload = {
        Login: loginValue,
        Password: passwordValue,
        Type: 'PASS',
      }

      setConnectWithPassLoader(true)

      if (isEditPage) {
        await api.tracker
          .UpdateUserTrackerCredentials({
            TrackerID,
            Credentials: credentialPayloadByPass,
          })
          .then(() => {
            setLoading(true)
            redirectAndClearContext()
          })

        updateUserTracker()
      } else {
        await api.tracker
          .AddUserTrackerCredentials({
            URL: trackerUrl,
            Type: trackerType,
            Credentials: credentialPayloadByPass,
          })
          .then(() => {
            setLoading(true)
            redirectAndClearContext()
          })

        addUserTracker()
      }

      updateCacheByTrackersIDArray(TrackerID)

      showAlert({
        alertType: 'success',
        alertMessage: 'Integration successfully ' + (isEditPage ? 'updated' : 'added'),
      })
    } catch (error) {
      console.error(error)
      showAlert({ alertType: 'error', alertMessage: error.message })
    } finally {
      setConnectWithPassLoader(false)
      setLoading(false)
    }
  }

  const handlePassInputValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputTargetValue = e.target.value
    setPasswordValue(inputTargetValue)
  }

  const handleLoginInputValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputTargetValue = e.target.value
    setLoginValue(inputTargetValue)
  }

  const togglePasswordShowing = () => {
    setPasswordShow(!isPasswordShow)
  }

  return (
    <div className={viaPassStyles.passBlock}>
      <label htmlFor="login">Login</label>
      <input type="text" placeholder="Login" value={loginValue} onChange={e => handleLoginInputValue(e)} id="login" />
      <label htmlFor="password">Password</label>
      <div className={viaPassStyles.passInputWrap}>
        <input
          type={isPasswordShow ? 'text' : 'password'}
          placeholder="Password"
          value={passwordValue}
          onChange={e => handlePassInputValue(e)}
          id="password"
        />
        <div
          className={classNames(viaPassStyles.iconBlock, {
            [viaPassStyles.iconBlockShow]: isPasswordShow,
          })}
          onClick={togglePasswordShowing}
        >
          <IconWrapper name="eye" width="20px" height="20px" />
        </div>
      </div>
      <div className={styles.bottomBlock}>
        <button
          type="button"
          className={styles.connectBtn}
          onClick={addIntegrationViaPass}
          disabled={isConnectWithPassLoader}
        >
          {isEditPage ? 'Reconnect' : 'Connect'}
        </button>
        {isConnectWithPassLoader ? <Loading proportions={30} /> : null}
      </div>
    </div>
  )
}

export default React.memo(ConnectViaPass)
