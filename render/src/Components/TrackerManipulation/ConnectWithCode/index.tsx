import * as React from 'react'
import * as alertActions from '@store/alerts/actions'
import * as _ from 'lodash'

import { getTokenFromOAuthWindow } from '@services/login-via-window'
import { updateCacheByTrackersIDArray, fetchTrackerViaUrl } from '../helpers'
import { IOAuthCodePayload } from '@services/api-types'
import api from '@services/api'
import { useDispatch } from 'react-redux'
import { useDebouncedCallback } from 'use-debounce'
import { ALL_SUPPORTED_TRACKERS } from '@services/helpers'
import { isUrlValid } from '@services/typesValidation'
import ButtonForHelpWindow from '../ButtonForHelpWindow'
import Loading from '@components/Loading'

const styles = require('../styles.module.scss')
const codeStyles = require('./code.module.scss')

interface IOwnProps {
  trackerUrl: string
  placeholder?: string
  trackerType: string
  TrackerID: number
  isEditPage: boolean
  setTrackerUrl: any
  isUrlLocked: boolean
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  setReadyToConnect: React.Dispatch<React.SetStateAction<boolean>>
  setGetTrackerLoad: React.Dispatch<React.SetStateAction<boolean>>
  addUserTracker: () => void
  updateUserTracker: () => void
  isDisableLoginViaOauth: boolean
  isReadyToConnect: boolean
  isGetTrackerLoad: boolean
  redirectAndClearContext: () => void
}

const ConnectViaCode: React.FC<IOwnProps> = props => {
  const {
    TrackerID,
    trackerUrl,
    placeholder,
    trackerType,
    isEditPage,
    setTrackerUrl,
    isUrlLocked,
    setLoading,
    addUserTracker,
    isDisableLoginViaOauth,
    updateUserTracker,
    isReadyToConnect,
    setReadyToConnect,
    isGetTrackerLoad,
    setGetTrackerLoad,
    redirectAndClearContext,
  } = props

  const [urlInputValue, setUrlInputValue] = React.useState(trackerUrl || '')
  const [trackerName, setTrackerName] = React.useState('')
  const [isBtnLoginDisabled, setBtnLoginDisabled] = React.useState(true)

  React.useEffect(() => {
    const tracker = ALL_SUPPORTED_TRACKERS.find(t => t.Type === trackerType)
    setTrackerName(tracker ? tracker.Name : trackerType)
  }, [trackerType])

  React.useEffect(() => {
    setUrlInputValue(trackerUrl)
  }, [isEditPage, trackerType, trackerUrl])

  React.useEffect(() => {
    if (urlInputValue.length === 0 || !isReadyToConnect) {
      setBtnLoginDisabled(true)
    } else {
      setBtnLoginDisabled(false)
    }
  }, [urlInputValue, isReadyToConnect])

  const dispatch = useDispatch()

  const showAlert = React.useCallback(
    alert => {
      const action = alertActions.showAlertMessage.request(alert)
      dispatch(action)
    },
    [dispatch],
  )

  const [updateInputValueForValidate] = useDebouncedCallback(() => {
    if (!urlInputValue) {
      return
    }

    const isTrackerUrlValid = isUrlValid(urlInputValue)

    if (isTrackerUrlValid) {
      setGetTrackerLoad(true)
      setTrackerUrl(urlInputValue)
      showAlert({ alertType: 'success', alertMessage: 'Url is valid' })
    } else {
      showAlert({ alertType: 'error', alertMessage: 'Pls, set correct url' })
    }
  }, 1000)

  const addIntegrationViaCode = async () => {
    try {
      setGetTrackerLoad(true)
      setBtnLoginDisabled(true)

      const { URL } = await fetchTrackerViaUrl(trackerUrl)

      if (URL) {
        setGetTrackerLoad(false)
        setBtnLoginDisabled(false)
      }

      const { oauthKey } = await getTokenFromOAuthWindow(URL)

      const payload: IOAuthCodePayload = { TrackerID }

      payload.Code = oauthKey
      payload.Token = oauthKey

      setLoading(true)

      await api.tracker.UseOAuthCode({ TrackerID, Code: oauthKey })

      updateCacheByTrackersIDArray(TrackerID)

      if (isEditPage) {
        updateUserTracker()
      } else {
        addUserTracker()
      }

      showAlert({
        alertType: 'success',
        alertMessage: 'Integration successfully ' + (isEditPage ? 'updated' : 'connected'),
      })
    } catch (error) {
      console.error(error)
      showAlert({ alertType: 'error', alertMessage: error.message })
    } finally {
      redirectAndClearContext()
      setLoading(false)
    }
  }

  const handleUrlInputValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInputValue(e.target.value)
    setReadyToConnect(false)
    updateInputValueForValidate()
  }

  return (
    <div className={codeStyles.codeBlock}>
      <label htmlFor="url">{trackerType.toLowerCase()} URL</label>
      <input
        type="text"
        placeholder={placeholder}
        value={urlInputValue}
        onChange={e => handleUrlInputValue(e)}
        disabled={isUrlLocked || isEditPage}
        id="url"
      />

      {isDisableLoginViaOauth ? (
        <div className={codeStyles.controlBlock}>
          <div className={codeStyles.btnBlock}>
            <button
              type="button"
              disabled={isBtnLoginDisabled}
              className={styles.loginBtn}
              onClick={addIntegrationViaCode}
            >
              {(!isEditPage ? 'Login ' : 'Reconnect ') + 'Via ' + trackerName}
            </button>
            {isGetTrackerLoad ? <Loading proportions={45} /> : null}
          </div>
          <ButtonForHelpWindow trackerType={trackerType} />
        </div>
      ) : (
        <ButtonForHelpWindow trackerType={trackerType} />
      )}
    </div>
  )
}

export default React.memo(ConnectViaCode)
