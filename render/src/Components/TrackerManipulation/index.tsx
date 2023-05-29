import * as React from 'react'
import * as _ from 'lodash'
import * as trackersActions from '@store/trackers/actions'
import * as alertActions from '@store/alerts/actions'

import { MainContext } from '@Routers'
import { ALL_SUPPORTED_TRACKERS } from '@services/helpers'
import { useDispatch } from 'react-redux'
import { ITrackerWithStatus } from '@services/types'
import { push } from 'connected-react-router'

import api from '@services/api'
import useShallowEqualSelector from '@services/useShallowEqualSelector'
import Spinner from '@components/Spinner'
import ConnectViaCode from './ConnectWithCode/index'
import ConnectViaToken from './ConnectWithToken/index'
import ConnectViaPass from './ConnectWithPass/index'
import RemoveTracker from './RemoveIntegration/index'

const styles = require('./styles.module.scss')

const TrackerManipulation: React.FC = props => {
  const context = React.useContext(MainContext)
  const userTrackers = useShallowEqualSelector(state => state.trackers.userTrackers)
  const trackerType = context.TrackerType
  const chosenUserTracker = userTrackers.find(item => item.Type === trackerType)
  const chosenSupportedTracker = ALL_SUPPORTED_TRACKERS.find(item => item.Type === trackerType)
  const isEditPage = !!chosenUserTracker
  const chosenTrackerUrl = _.get(chosenSupportedTracker, 'TrackerUrl', '')
  const chosenTrackerPlaceholder = _.get(chosenSupportedTracker, 'Placeholder', '')
  const chosenUserTrackerUrl = _.get(chosenUserTracker, 'URL', '')
  const isUrlLocked = _.get(chosenSupportedTracker, 'IsUrlLocked', false)
  const isEmptyUserTrackers = _.isEmpty(userTrackers.filter(tracker => tracker.Type !== 'TGTRACKER'))
  const [trackerUrl, setTrackerUrl] = React.useState(chosenUserTrackerUrl || chosenTrackerUrl)
  const [TrackerID, setTrackerID] = React.useState(null)
  const [isLoading, setLoading] = React.useState(true)
  const [oauthMethods, setOauthMethods] = React.useState([])
  const [isReadyToConnectTracker, setReadyToConnectTracker] = React.useState(false)
  const [isGetTrackerLoad, setGetTrackerLoad] = React.useState(false)
  const isLoginViaToken = oauthMethods.includes('TOKEN')
  const isLoginViaPass = oauthMethods.includes('PASS')
  const isDisableLoginViaOauth = oauthMethods.some(el => el === 'OAUTH' || el === 'OAUTH2')

  const dispatch = useDispatch()

  const addTracker = React.useCallback(() => {
    const newTrackerPayload: ITrackerWithStatus = {
      CredentialType: '',
      Data: null,
      Error: null,
      ID: TrackerID,
      ParentID: -1,
      Status: true,
      TrackerUserMail: '',
      Type: trackerType,
      URL: trackerUrl,
    }

    const action = trackersActions.addUserTracker(newTrackerPayload)
    dispatch(action)
  }, [dispatch, trackerUrl, TrackerID, trackerType])

  const showAlert = React.useCallback(
    alert => {
      const action = alertActions.showAlertMessage.request(alert)
      dispatch(action)
    },
    [dispatch],
  )

  const updateTracker = React.useCallback(() => {
    const updateTrackerPayload = {
      URL: trackerUrl,
      ID: TrackerID,
    }

    const action = trackersActions.updateUserTracker(updateTrackerPayload)
    dispatch(action)
  }, [dispatch, trackerUrl, TrackerID])

  const redirect = React.useCallback(
    path => {
      const action = push(path)
      dispatch(action)
    },
    [dispatch],
  )

  React.useEffect(() => {
    if (!trackerUrl) {
      return
    }

    api.tracker
      .GetTracker({ URL: trackerUrl })
      .then(item => {
        if (item.Type !== trackerType) {
          throw new Error('You set url from wrong tracker')
        } else {
          return item
        }
      })
      .then(item => {
        setTrackerUrl(item.URL)
        setTrackerID(item.TrackerID)
        setReadyToConnectTracker(true)
      })
      .catch(error => {
        setReadyToConnectTracker(false)
        console.error(error)
        let { message } = error
        if (error.code === 156) {
          message = 'Tracker not found. Check the url or contact our support team.'
        }
        showAlert({ alertType: 'error', alertMessage: message })
      })
      .finally(() => {
        setGetTrackerLoad(false)
      })
  }, [trackerUrl])

  React.useEffect(() => {
    if (!TrackerID && !trackerType) {
      return
    }

    api.tracker
      .GetAuthMethods({ TrackerID, Type: trackerType })
      .then(item => {
        setOauthMethods(item.Methods)
      })
      .catch(error => console.error(error))
      .finally(() => {
        setLoading(false)
      })
  }, [TrackerID])

  React.useEffect(() => {
    setTrackerUrl(chosenUserTrackerUrl || chosenTrackerUrl)
  }, [isEditPage, trackerType])

  const addUserTracker = () => {
    addTracker()
  }

  const updateUserTracker = () => {
    updateTracker()
  }

  const redirectAndClearContext = () => {
    context.clearContext()

    if (isEmptyUserTrackers) {
      redirect('/main')
    } else {
      redirect('/main/userTrackers')
    }
  }

  return isLoading ? (
    <Spinner />
  ) : (
    <div className={styles.trackerManipulationBlock}>
      <div className={styles.trackerManipulationForm}>
        <ConnectViaCode
          trackerUrl={trackerUrl}
          placeholder={chosenTrackerPlaceholder}
          TrackerID={TrackerID}
          trackerType={trackerType}
          isEditPage={isEditPage}
          setTrackerUrl={setTrackerUrl}
          isUrlLocked={isUrlLocked}
          setLoading={setLoading}
          addUserTracker={addUserTracker}
          isDisableLoginViaOauth={isDisableLoginViaOauth}
          updateUserTracker={updateUserTracker}
          isReadyToConnect={isReadyToConnectTracker}
          setReadyToConnect={setReadyToConnectTracker}
          isGetTrackerLoad={isGetTrackerLoad}
          setGetTrackerLoad={setGetTrackerLoad}
          redirectAndClearContext={redirectAndClearContext}
        />

        {isLoginViaPass && (
          <ConnectViaPass
            isEditPage={isEditPage}
            TrackerID={TrackerID}
            trackerType={trackerType}
            trackerUrl={trackerUrl}
            setLoading={setLoading}
            addUserTracker={addUserTracker}
            updateUserTracker={updateUserTracker}
            redirectAndClearContext={redirectAndClearContext}
          />
        )}

        {isLoginViaToken && (
          <ConnectViaToken
            trackerUrl={trackerUrl}
            TrackerID={TrackerID}
            trackerType={trackerType}
            isEditPage={isEditPage}
            setLoading={setLoading}
            addUserTracker={addUserTracker}
            updateUserTracker={updateUserTracker}
            isDisableLoginViaOauth={isDisableLoginViaOauth}
            redirectAndClearContext={redirectAndClearContext}
          />
        )}
      </div>

      {isEditPage && <RemoveTracker TrackerID={TrackerID} />}
    </div>
  )
}

export default React.memo(TrackerManipulation)
