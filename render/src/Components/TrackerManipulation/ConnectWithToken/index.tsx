import * as React from 'react'
import * as alertActions from '@store/alerts/actions'
import api from '@services/api'

import { ITokenCredentialsPayload } from '@services/api-types'
import { useDispatch } from 'react-redux'
import { updateCacheByTrackersIDArray } from '../helpers'
import Loading from '@components/Loading'

const styles = require('../styles.module.scss')
const tokenStyles = require('./token.module.scss')

interface IOwnProps {
  trackerUrl: string
  TrackerID: number
  isEditPage: boolean
  trackerType: string
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  addUserTracker: () => void
  updateUserTracker: () => void
  isDisableLoginViaOauth: boolean
  redirectAndClearContext: () => void
}

const ConnectViaToken: React.FC<IOwnProps> = props => {
  const {
    TrackerID,
    trackerUrl,
    trackerType,
    isEditPage,
    setLoading,
    addUserTracker,
    updateUserTracker,
    isDisableLoginViaOauth,
    redirectAndClearContext,
  } = props

  const [tokenInputValue, setTokenInputValue] = React.useState('')
  const [isTokenConnectLoader, setTokenConnectLoader] = React.useState(false)

  const dispatch = useDispatch()

  const showAlert = React.useCallback(
    alert => {
      const action = alertActions.showAlertMessage.request(alert)
      dispatch(action)
    },
    [dispatch],
  )

  const addIntegrationViaToken = async () => {
    try {
      if (!tokenInputValue) {
        return
      }

      const credentialPayloadByToken: ITokenCredentialsPayload = {
        Token: tokenInputValue,
        Type: 'TOKEN',
      }

      setTokenConnectLoader(true)

      if (isEditPage) {
        await api.tracker
          .UpdateUserTrackerCredentials({
            TrackerID,
            Credentials: credentialPayloadByToken,
          })
          .then(() => {
            setLoading(true)
            redirectAndClearContext()
          })

        updateUserTracker()
      } else {
        await api.tracker
          .AddUserTrackerCredentials({
            Credentials: credentialPayloadByToken,
            Type: trackerType,
            URL: trackerUrl,
          })
          .then(() => {
            setLoading(true)
            redirectAndClearContext()
          })

        addUserTracker()
      }

      setTokenInputValue('')

      updateCacheByTrackersIDArray(TrackerID)

      showAlert({
        alertType: 'success',
        alertMessage: 'Integration successfully ' + (isEditPage ? 'updated' : 'connected'),
      })
    } catch (error) {
      console.error(error)
      let { message } = error

      if (error.code === -32000 && error.message === 'Wrong PSA Key') {
        message = 'Invalid Token'
      }

      showAlert({ alertType: 'error', alertMessage: message })
    } finally {
      setTokenConnectLoader(false)
      setLoading(false)
    }
  }

  const handleTokenInputValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTokenInputValue(e.target.value)
  }

  return (
    <div className={tokenStyles.tokenBlock}>
      {isDisableLoginViaOauth && <h2>or sync with authorization token</h2>}
      <label htmlFor="token">Token</label>
      <input
        type="text"
        placeholder="Token"
        id="token"
        value={tokenInputValue}
        onChange={e => handleTokenInputValue(e)}
      />
      <div className={styles.bottomBlock}>
        <button type="button" className={styles.connectBtn} onClick={addIntegrationViaToken}>
          {(isEditPage ? 'Update' : 'Connect') + ' With Token'}
        </button>
        {isTokenConnectLoader ? <Loading proportions={35} /> : null}
      </div>
    </div>
  )
}

export default React.memo(ConnectViaToken)
